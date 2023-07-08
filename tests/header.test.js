const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

test("The logo has the correct text", async () => {
  const text = await page.getContent("a.brand-logo");
  expect(text).toEqual("Blogster");
});

test("clicking login starts oAuth flow", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toContain("accounts.google.com");
});

test("When signed in, shows logout button", async () => {
  await page.login();

  const text = await page.getContent('a[href="/auth/logout"]');
  expect(text).toEqual("Logout");
});
