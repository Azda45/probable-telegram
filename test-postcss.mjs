import postcss from 'postcss';
import fs from 'fs';
import tailwindcss from '@tailwindcss/postcss';

const css = fs.readFileSync('src/app/globals.css', 'utf8');

postcss([tailwindcss])
  .process(css, { from: 'src/app/globals.css' })
  .then(result => {
    fs.writeFileSync('out.css', result.css);
    console.log('Compiled successfully');
  })
  .catch(err => {
    console.error(err);
  });
