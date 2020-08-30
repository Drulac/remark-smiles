import {Plugin} from 'unified' // eslint-disable-line import/no-extraneous-dependencies

declare namespace remarkSmiles {
  interface RemarkSmilesOptions {
    inlineSmilesDouble?: boolean
  }

  type Smiles = Plugin<[RemarkSmilesOptions?]>
}

declare const remarkSmiles: remarkSmiles.Smiles

export = remarkSmiles
