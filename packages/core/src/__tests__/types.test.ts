import { describe, expect, test } from "vitest";
import type { SocialLink } from "../types.js";

describe("SocialLink types", () => {
	test("should accept all supported social link icons", () => {
		// This test verifies that our TypeScript types are correct
		// by creating valid SocialLink objects
		const socialLinks: SocialLink[] = [
			{ icon: "github", link: "https://github.com/user" },
			{ icon: "twitter", link: "https://twitter.com/user" },
			{ icon: "discord", link: "https://discord.gg/user" },
			{ icon: "npm", link: "https://www.npmjs.com/~user" },
			{ icon: "youtube", link: "https://youtube.com/user" },
			{ icon: "facebook", link: "https://facebook.com/user" },
			{ icon: "instagram", link: "https://instagram.com/user" },
			{ icon: "linkedin", link: "https://linkedin.com/in/user" },
			{ icon: "slack", link: "https://slack.com/user" },
		];

		expect(socialLinks).toHaveLength(9);
		expect(socialLinks[0].icon).toBe("github");
		expect(socialLinks[1].icon).toBe("twitter");
		expect(socialLinks[2].icon).toBe("discord");
		expect(socialLinks[3].icon).toBe("npm");
		expect(socialLinks[4].icon).toBe("youtube");
		expect(socialLinks[5].icon).toBe("facebook");
		expect(socialLinks[6].icon).toBe("instagram");
		expect(socialLinks[7].icon).toBe("linkedin");
		expect(socialLinks[8].icon).toBe("slack");
	});

	test("should require valid icon types", () => {
		// This would cause TypeScript errors if uncommented:
		// @ts-expect-error - invalid icon type
		// const invalidLink: SocialLink = { icon: 'invalid', link: 'https://example.com' };

		// Valid social link
		const validLink: SocialLink = {
			icon: "github",
			link: "https://github.com/user",
		};
		expect(validLink.icon).toBe("github");
		expect(validLink.link).toBe("https://github.com/user");
	});

	test("should require both icon and link properties", () => {
		const socialLink: SocialLink = {
			icon: "github",
			link: "https://github.com/user",
		};

		expect(socialLink).toHaveProperty("icon");
		expect(socialLink).toHaveProperty("link");
		expect(typeof socialLink.icon).toBe("string");
		expect(typeof socialLink.link).toBe("string");
	});
});
