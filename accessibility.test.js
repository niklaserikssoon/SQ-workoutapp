import fs from "fs";
import path from "path";
import { axe } from "jest-axe";

test("index.html should have no accessibility violations", async () => {
  const htmlPath = path.join(process.cwd(), "src", "index.html");
  const html = fs.readFileSync(htmlPath, "utf8");

  document.documentElement.innerHTML = html;

  const results = await axe(document.body);
  expect(results).toHaveNoViolations();
});