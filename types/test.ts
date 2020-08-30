import unified from 'unified' // eslint-disable-line import/no-extraneous-dependencies
import smiles from 'remark-smiles'

// $ExpectType Processor<Settings>
unified().use(smiles)
// $ExpectType Processor<Settings>
unified().use(smiles, {inlineSmilesDouble: true})
// $ExpectError
unified().use(smiles, {inlineSmilesDouble: 3})
// $ExpectError
unified().use(smiles, {invalidProp: true})
