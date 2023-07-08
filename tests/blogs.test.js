const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("When logged in", async () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating");
  });

  test("Can see blog create form", async () => {
    const label = await page.getContent("form label");
    expect(label).toEqual("Blog Title");
  });

  describe("And using valid inputs", async () => {
    beforeEach(async () => {
      await page.type(".title input", "My Title by Unit test");
      await page.type(".content input", "My Content by Unit Testing");
      await page.click("form button");
    });

    test("Submitting takes user to review screen", async () => {
      const confirm = await page.getContent("form h5");
      expect(confirm).toEqual("Please confirm your entries");
    });

    test("Submitting then adds blog to index page", async () => {
      await page.click("button.green");
      await page.waitFor(".card");

      const title = await page.getContent(".card-title");
      const content = await page.getContent("p");

      expect(title).toEqual("My Title by Unit test");
      expect(content).toEqual("My Content by Unit Testing");
    });
  });

  describe("And using invalid inputs", async () => {
    beforeEach(async () => {
      await page.click("form button");
    });
    test("the form shows an error message", async () => {
      const titleError = await page.getContent(".title .red-text");
      const contentError = await page.getContent(".content .red-text");

      expect(titleError).toEqual("You must provide a value");
      expect(contentError).toEqual("You must provide a value");
    });
  });
});

describe("When not logged in", async () => {
  test("Not able to create blog posts", async () => {
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application-json",
        },
        body: JSON.stringify({ title: "My Title", content: "My Content" }),
      }).then((res) => res.json());
    });
    expect(result).toEqual({ error: "You must log in!" });
  });

  test("Not able to read blogs", async () => {
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        credentials: "same-origin",
        headers: {
          "Content-Type": "application-json",
        },
      }).then((res) => res.json());
    });
    expect(result).toEqual({ error: "You must log in!" });
  });
});
