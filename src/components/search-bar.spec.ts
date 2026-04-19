import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { describe, expect, it } from "vitest";
import SearchBar from "@/components/SearchBar.vue";

describe("SearchBar", () => {
  it("mounts without error", () => {
    const wrapper = mount(SearchBar, {
      global: {
        plugins: [createPinia()],
      },
    });
    expect(wrapper.find(".search-bar").exists()).toBe(true);
  });
});
