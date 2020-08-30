# remark-smiles
remark tokenizer for SMILES chemical syntaxe

[**remark**][remark] plugin to parse and stringify SMILES.

this was created by modifing [remark-math](https://github.com/remarkjs/remark-math/)

## Install

[npm][]:

```sh
npm install remark-smiles
```

## Use

SMILES molecules have to be between `€` or `€€` signs (`Ctrl`+`E` on most (_FR ?_) keyboards)

Say we have the following file, `example.md`:

```markdown
Ethanol (€CCO€)

€€C1CCCC1C€€
```

And our script, `example.js`, looks as follows:

```js
const vfile = require('to-vfile')
const unified = require('unified')
const markdown = require('remark-parse')
const remarkSmiles = require('remark-smiles')
const remark2rehype = require('remark-rehype')
const rehypeSmiles = require('rehype-smiles')
const stringify = require('rehype-stringify')

unified()
  .use(markdown)
  .use(remarkSmiles)
  .use(remark2rehype)
  .use(rehypeSmiles)
  .use(stringify)
  .process(vfile.readSync('example.md'), function(err, file) {
    if (err) throw err
    console.log(String(file))
  })
```

Now, running `node example` yields:

```html

```

## API

### `remark().use(remarkSmiles[, options])`

Parse and stringify SMILES.

Get’s useful when combined with [`rehype-smiles`][rehype-smiles].

You can also support only inline, or online block SMILES, by importing them
directly:

```js
const smilesInline = require('remark-smiles/inline')

// …

unified()
  // …
  .use(smilesInline)
  // …
```

#### `options`

##### `options.inlineSmilesDouble`

Add an extra `smiles-display` class to inline `€€` smiles (default: `false`).

## Security

Use of `remark-smiles` itself doesn’t open you up to [cross-site scripting
(XSS)][xss] attacks.

Always be wary of user input and use [`rehype-sanitize`][rehype-sanitize].

<!-- Definitions -->

[size]: https://bundlephobia.com/result?p=remark-math

[npm]: https://docs.npmjs.com/cli/install
