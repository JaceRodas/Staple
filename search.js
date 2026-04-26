document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchModal = document.getElementById("searchModal");

  if (!searchInput || !searchModal) return;

  const shirtCatalog = [
    {
      name: "Plain Black Oversized Shirt",
      href: "/Clothes_Sites/Oversized/Oversized.html",
      type: "Oversized",
      color: "Black",
      design: "Plain",
      tags: ["oversized", "plain", "black", "basic", "tee"],
    },
    {
      name: "Blue Oversized Shirt",
      href: "/Clothes_Sites/Oversized/BlueOversized.html",
      type: "Oversized",
      color: "Blue",
      design: "Plain",
      tags: ["oversized", "blue", "plain", "basic", "tee"],
    },
    {
      name: "Urban Eagle Oversized Shirt",
      href: "/Clothes_Sites/Oversized/UrbanEagle.html",
      type: "Oversized",
      color: "Blue",
      design: "Urban Eagle",
      tags: ["oversized", "blue", "urban", "eagle", "graphic"],
    },
    {
      name: "Staple Dove Emblem Oversized Shirt",
      href: "/Clothes_Sites/Oversized/StapleDoveEmblem.html",
      type: "Oversized",
      color: "Green",
      design: "Dove Emblem",
      tags: ["oversized", "green", "dove", "emblem", "graphic", "staple"],
    },
    {
      name: "Plain Black Regular Shirt",
      href: "/Clothes_Sites/Regular Fit/Regular Fit.html",
      type: "Regular Fit",
      color: "Black",
      design: "Plain",
      tags: ["regular", "regular fit", "black", "plain", "basic", "tee"],
    },
    {
      name: "Gray Regular Shirt",
      href: "/Clothes_Sites/Regular Fit/GrayRegular.html",
      type: "Regular Fit",
      color: "Gray",
      design: "Plain",
      tags: ["regular", "regular fit", "gray", "plain", "basic"],
    },
    {
      name: "Green Regular Shirt",
      href: "/Clothes_Sites/Regular Fit/GreenRegular.html",
      type: "Regular Fit",
      color: "Green",
      design: "Plain",
      tags: ["regular", "regular fit", "green", "plain", "basic"],
    },
    {
      name: "All Over Street Grid Regular Shirt",
      href: "/Clothes_Sites/Regular Fit/AllOverStreetGrid.html",
      type: "Regular Fit",
      color: "Gray",
      design: "Street Grid",
      tags: ["regular", "regular fit", "grid", "street", "all over", "graphic"],
    },
    {
      name: "Plain Black Cropped Shirt",
      href: "/Clothes_Sites/Cropped Box/Cropped Box.html",
      type: "Cropped Box",
      color: "Black",
      design: "Plain",
      tags: ["cropped", "cropped box", "black", "plain", "basic"],
    },
    {
      name: "Wireframe Cropped Shirt",
      href: "/Clothes_Sites/Cropped Box/WireframeCropped.html",
      type: "Cropped Box",
      color: "Black",
      design: "Wireframe",
      tags: ["cropped", "cropped box", "wireframe", "graphic", "black"],
    },
    {
      name: "Tool and Logo Embroidery Cropped Shirt",
      href: "/Clothes_Sites/Cropped Box/ToolLogoEmbroidery.html",
      type: "Cropped Box",
      color: "Navy",
      design: "Tool and Logo Embroidery",
      tags: ["cropped", "cropped box", "tool", "logo", "embroidery", "navy"],
    },
    {
      name: "Minimalist Tool Embroidery Cropped Shirt",
      href: "/Clothes_Sites/Cropped Box/MinimalistToolEmbroidery.html",
      type: "Cropped Box",
      color: "Navy",
      design: "Minimalist Tool Embroidery",
      tags: ["cropped", "cropped box", "minimalist", "tool", "embroidery", "navy"],
    },
  ];

  const normalize = (value) =>
    String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ");

  const tokenize = (value) => normalize(value).split(" ").filter(Boolean);

  const withCoreTags = (item) => {
    const manualTags = Array.isArray(item.tags) ? item.tags : [];
    const coreTags = [
      ...tokenize(item.type),
      ...tokenize(item.color),
      ...tokenize(item.design),
      normalize(item.type),
      normalize(item.color),
      normalize(item.design),
    ].filter(Boolean);

    const tags = Array.from(
      new Set([...manualTags.map((tag) => normalize(tag)), ...coreTags])
    );

    return { ...item, tags };
  };

  const searchableCatalog = shirtCatalog.map(withCoreTags);

  const computeScore = (item, terms) => {
    if (!terms.length) return 0;

    const searchable = normalize([
      item.name,
      item.type,
      item.color,
      item.design,
      ...(item.tags || []),
    ].join(" "));

    let score = 0;
    for (const term of terms) {
      if (!searchable.includes(term)) {
        return -1;
      }
      if (normalize(item.name).includes(term)) score += 8;
      if (normalize(item.type).includes(term)) score += 4;
      if (normalize(item.color).includes(term)) score += 3;
      if (normalize(item.design).includes(term)) score += 3;
      if ((item.tags || []).some((tag) => normalize(tag).includes(term))) score += 2;
    }

    if (normalize(item.name).startsWith(terms.join(" "))) score += 5;
    return score;
  };

  const findMatches = (query) => {
    const terms = tokenize(query);
    if (!terms.length) return searchableCatalog;

    return searchableCatalog
      .map((item) => ({ item, score: computeScore(item, terms) }))
      .filter((entry) => entry.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
  };

  const results = document.createElement("div");
  results.id = "searchResults";
  results.className = "staple-search-results";
  searchModal.appendChild(results);

  const styleId = "stapleSearchStyles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .staple-search-results { margin-top: 10px; max-height: 300px; overflow-y: auto; display: grid; gap: 8px; }
      .staple-search-empty { color: #666; font-size: 14px; padding: 8px 4px; }
      .staple-search-result { display: block; text-decoration: none; color: #111; background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 10px 12px; }
      .staple-search-result:hover { border-color: #999; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08); }
      .staple-search-name { font-size: 14px; font-weight: 700; line-height: 1.3; }
      .staple-search-meta { margin-top: 4px; font-size: 12px; color: #555; }
      .staple-search-tags { margin-top: 4px; font-size: 11px; color: #777; }
    `;
    document.head.appendChild(style);
  }

  const render = (query) => {
    const matches = findMatches(query);
    results.innerHTML = "";

    if (!matches.length) {
      const empty = document.createElement("div");
      empty.className = "staple-search-empty";
      empty.textContent = "No shirts found. Try type, color, or design tags.";
      results.appendChild(empty);
      return matches;
    }

    for (const item of matches) {
      const anchor = document.createElement("a");
      anchor.className = "staple-search-result";
      anchor.href = item.href;
      anchor.innerHTML = `
        <div class="staple-search-name">${item.name}</div>
        <div class="staple-search-meta">${item.type} · ${item.color} · ${item.design}</div>
        <div class="staple-search-tags">Tags: ${item.tags.join(", ")}</div>
      `;
      results.appendChild(anchor);
    }

    return matches;
  };

  render("");

  searchInput.addEventListener("input", () => {
    render(searchInput.value);
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const matches = render(searchInput.value);
    if (!matches.length) return;
    window.location.href = matches[0].href;
  });
});
