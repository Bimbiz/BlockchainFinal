require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3001;
const PROVIDER_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const CROWDFUND_ADDRESS = process.env.CROWDFUND_ADDRESS;

app.use(express.static(__dirname));
app.use(cors({ origin: "*" }));
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.log("Error verifying email server: " + error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

const ABI = [
  "event ContributionReceived(uint256 id, address contributor, uint256 amount, uint256 rewardAmount)",
  "function getAllCampaigns() public view returns (tuple(string title, uint256 goal, uint256 deadline, uint256 totalRaised)[])",
];

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const contract = new ethers.Contract(CROWDFUND_ADDRESS, ABI, provider);

let emailQueue = {};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/register-email", (req, res) => {
  const { address, email } = req.body;
  if (!address || !email)
    return res.status(400).json({ error: "Missing data" });
  emailQueue[address.toLowerCase()] = email;
  console.log(`Email ${email} was saved for the address ${address}`);
  res.json({ status: "success" });
});

contract.on(
  "ContributionReceived",
  async (id, contributor, amount, reward, event) => {
    const txHash = event.log.transactionHash;
    const userEmail = emailQueue[contributor.toLowerCase()];

    const ethAmount = ethers.formatEther(amount);

    console.log(
      `Got a donate! Project: #${id} | Amount: ${ethAmount} ETH | From: ${contributor}`,
    );

    if (userEmail) {
      const mailOptions = {
        from: `"BeginUp Gaming" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Your gift from BeginUp Gaming!",
        html: `
                <div style="font-family: sans-serif; border: 2px solid #e94560; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #0f3460;">Thank you for your support!</h2>
                    <p>You donated <b>${ethAmount} ETH</b> to project #${id}.</p>
                    <p>Your unique activation code (transaction hash):</p>
                    <div style="background: #f4f4f4; padding: 15px; font-family: monospace; word-break: break-all;">
                        ${txHash}
                    </div>
                </div>
            `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${userEmail}`);
        delete emailQueue[contributor.toLowerCase()];
      } catch (err) {
        console.error("Error sending email:", err);
      }
    } else {
      console.log(
        `Email for ${contributor} not found. Make sure that form is submitted before donating.`,
      );
    }
  },
);

app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`Contract: ${CROWDFUND_ADDRESS}`);
});
