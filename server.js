require('dotenv').config();
const express = require("express");
const { ethers } = require("ethers");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();

// --- НАСТРОЙКИ ИЗ .ENV ---
const PORT = process.env.PORT || 3001;
const PROVIDER_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const CROWDFUND_ADDRESS = process.env.CROWDFUND_ADDRESS;

// --- МИДДЛВЕР (Для работы HTML и API) ---
app.use(express.static(__dirname)); 
app.use(cors({ origin: "*" }));
app.use(express.json());

// --- НАСТРОЙКА GMAIL ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Проверка готовности почты
transporter.verify((error) => {
    if (error) {
        console.log("❌ Ошибка настройки почты: " + error);
    } else {
        console.log("📧 Почтовый сервер Gmail готов к работе");
    }
});

// --- ПОДКЛЮЧЕНИЕ К БЛОКЧЕЙНУ ---
const ABI = [
    "event ContributionReceived(uint256 id, address contributor, uint256 amount, uint256 rewardAmount)",
    "function getAllCampaigns() public view returns (tuple(string title, uint256 goal, uint256 deadline, uint256 totalRaised)[])"
];

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const contract = new ethers.Contract(CROWDFUND_ADDRESS, ABI, provider);

let emailQueue = {};

// --- РОУТЫ ---

// Открывает index.html при переходе на http://localhost:3001
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Регистрация почты перед донатом
app.post("/register-email", (req, res) => {
    const { address, email } = req.body;
    if (!address || !email) return res.status(400).json({ error: "Missing data" });
    emailQueue[address.toLowerCase()] = email;
    console.log(`📩 Почта ${email} сохранена для кошелька ${address}`);
    res.json({ status: "success" });
});

// --- СЛУШАТЕЛЬ СОБЫТИЙ С ПОДДЕРЖКОЙ ЛЮБОЙ СУММЫ ---
contract.on("ContributionReceived", async (id, contributor, amount, reward, event) => {
    const txHash = event.log.transactionHash;
    const userEmail = emailQueue[contributor.toLowerCase()];
    
    // Конвертируем сумму из Wei в ETH для отображения в консоли
    const ethAmount = ethers.formatEther(amount);

    console.log(`✨ Обнаружен донат! Проект: #${id} | Сумма: ${ethAmount} ETH | От: ${contributor}`);

    if (userEmail) {
        const mailOptions = {
            from: `"BeginUp Gaming" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "🎮 Твой подарок от BeginUp!",
            html: `
                <div style="font-family: sans-serif; border: 2px solid #e94560; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #0f3460;">Спасибо за поддержку!</h2>
                    <p>Ты задонатил <b>${ethAmount} ETH</b> на развитие проекта #${id}.</p>
                    <p>Твой уникальный код активации (хэш транзакции):</p>
                    <div style="background: #f4f4f4; padding: 15px; font-family: monospace; word-break: break-all;">
                        ${txHash}
                    </div>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Письмо с кодом отправлено на ${userEmail}`);
            delete emailQueue[contributor.toLowerCase()]; // Удаляем из очереди
        } catch (err) {
            console.error("❌ Ошибка отправки Gmail:", err);
        }
    } else {
        console.log(`⚠️ Email для ${contributor} не найден. Убедись, что форма на сайте заполнена.`);
    }
});

// --- ЗАПУСК ---
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
    console.log(`📡 Контракт: ${CROWDFUND_ADDRESS}`);
});