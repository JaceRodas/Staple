const fs = require('fs');

const cssFiles = [
  'home.css',
  'Info/About.css',
  'Info/Contact.css',
  'Clothes_Sites/Cart/cart.css',
  'Clothes_Sites/Cropped Box/CroppedBox.css',
  'Clothes_Sites/Cropped Box/CboxShirt.css',
  'Clothes_Sites/Oversized/Oversized.css',
  'Clothes_Sites/Oversized/OverShirt.css',
  'Clothes_Sites/Regular Fit/Regular Fit.css',
  'Clothes_Sites/Regular Fit/RegShirt.css'
];

const jsFiles = [
  'home.js',
  'Info/Info.js',
  'Clothes_Sites/Cart/cart.js',
  'Clothes_Sites/Cropped Box/CroppedBox.js',
  'Clothes_Sites/Cropped Box/CboxShirt.js',
  'Clothes_Sites/Oversized/Oversized.js',
  'Clothes_Sites/Oversized/OverShirt.js',
  'Clothes_Sites/Regular Fit/Regular Fit.js',
  'Clothes_Sites/Regular Fit/RegShirt.js'
];

for (const file of cssFiles) {
  let text = fs.readFileSync(file, 'utf8');
  if (!text.includes('body.no-page-transition::before')) {
    text = text.replace(
      /body\.page-entered::before \{[\s\S]*?\}\s*\n\s*body\.page-exit::before \{/m,
`body.page-entered::before {
  transform: translateY(-100%);
}

body.no-page-transition::before {
  transition: none;
}

body.page-exit::before {`
    );
  }
  fs.writeFileSync(file, text, 'utf8');
}

for (const file of jsFiles) {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(
    /  \/\/ Page transition overlay: load goes up, navigation goes down[\s\S]*?  const navigateWithOverlay = \(url\) => \{/m,
`  // Page transition overlay: load goes up, navigation goes down
  const pageMemoryKey = "stapleLastLoadedPath";
  const currentPagePath = window.location.pathname;
  const lastLoadedPath = sessionStorage.getItem(pageMemoryKey);
  const shouldAnimateEntry = lastLoadedPath !== currentPagePath;

  if (document.body) {
    if (shouldAnimateEntry) {
      requestAnimationFrame(() => document.body.classList.add("page-entered"));
    } else {
      document.body.classList.add("no-page-transition", "page-entered");
      requestAnimationFrame(() => document.body.classList.remove("no-page-transition"));
    }
    sessionStorage.setItem(pageMemoryKey, currentPagePath);
  }

  const navigateWithOverlay = (url) => {`
  );
  fs.writeFileSync(file, text, 'utf8');
}

console.log('entry-once-per-page-enabled');


