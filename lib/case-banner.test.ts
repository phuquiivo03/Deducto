import assert from "node:assert/strict";
import test from "node:test";

import { bannerForDisplay, localPublicFileExists } from "./case-banner-server";
import { canUseNextImage, classifyBanner } from "./case-banner";

test("classifyBanner separates safe images from paths that must not render", () => {
  assert.equal(classifyBanner("  "), "empty");
  assert.equal(classifyBanner("/images/cases/stormy.jpg"), "local");
  assert.equal(classifyBanner("/images/../.env"), "invalid");
  assert.equal(classifyBanner("//evil.example/a.jpg"), "invalid");
  assert.equal(classifyBanner("javascript:alert(1)"), "invalid");
  assert.equal(
    classifyBanner("https://lh3.googleusercontent.com/a/photo"),
    "remote-allowed",
  );
  assert.equal(
    classifyBanner("https://images.example.com/case.jpg"),
    "remote-other",
  );
  assert.equal(canUseNextImage("remote-other"), false);
  assert.equal(canUseNextImage("local"), true);
  assert.equal(canUseNextImage("remote-allowed"), true);
});

test("missing local case banners are omitted and real public files stay", () => {
  assert.equal(localPublicFileExists("/user.svg"), true);
  assert.equal(
    localPublicFileExists("/images/cases/stormy-inheritance.jpg"),
    false,
  );
  assert.equal(
    bannerForDisplay("/images/cases/missing-sapphire.jpg"),
    "",
  );
  assert.equal(bannerForDisplay("/user.svg"), "/user.svg");
  assert.equal(
    bannerForDisplay("https://images.example.com/case.jpg"),
    "https://images.example.com/case.jpg",
  );
  assert.equal(bannerForDisplay("javascript:alert(1)"), "");
});
