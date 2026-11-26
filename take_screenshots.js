const puppeteer = require("puppeteer");

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // 1. Login page (1280x800)
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: "report_assets/fig_5_5_19_login.png" });
  console.log("Captured fig_5_5_19_login.png");

  // Login as admin
  await page.type("input[type=email]", "admin@pyqinsight.edu");
  await page.type("input[type=password]", "admin12345");
  await page.click("button");
  await new Promise((r) => setTimeout(r, 2000));

  // 2. Desktop Dashboard (1280x800)
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 2500));
  await page.screenshot({ path: "report_assets/fig_2_3_2_desktop_dashboard.png" });
  await page.screenshot({ path: "report_assets/fig_5_5_20_dashboard_heatmap_trend.png", fullPage: true });
  console.log("Captured desktop dashboard screenshots");

  // 3. Mobile Dashboard (390x844)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 2500));
  await page.screenshot({ path: "report_assets/fig_2_3_3_mobile_dashboard.png" });
  console.log("Captured mobile dashboard screenshot");

  // 4. Study planner (1280x800)
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/planner", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));
  // Submit plan
  await page.click("button");
  await new Promise((r) => setTimeout(r, 2500));
  await page.screenshot({ path: "report_assets/fig_5_5_21_study_planner.png", fullPage: true });
  console.log("Captured study planner screenshot");

  // 5. Admin upload and review queue
  await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 2500));
  await page.screenshot({ path: "report_assets/fig_5_5_22_admin_upload_review.png", fullPage: true });
  console.log("Captured admin screenshot");

  await browser.close();
}

capture().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
