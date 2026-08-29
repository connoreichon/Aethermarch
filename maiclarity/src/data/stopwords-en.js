/** English stop words. Excluded from the key term analysis. */
export const STOPWORDS_EN = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'almost', 'along', 'already',
  'also', 'although', 'always', 'am', 'among', 'an', 'and', 'another', 'any', 'anyone',
  'anything', 'are', 'around', 'as', 'at', 'back', 'be', 'became', 'because', 'become',
  'been', 'before', 'behind', 'being', 'below', 'best', 'better', 'between', 'both', 'but',
  'by', 'came', 'can', 'cannot', 'come', 'could', 'did', 'do', 'does', 'doing', 'done',
  'down', 'during', 'each', 'either', 'else', 'enough', 'even', 'ever', 'every', 'few',
  'first', 'for', 'from', 'further', 'get', 'gets', 'give', 'go', 'goes', 'going', 'good',
  'got', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'however', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'just', 'keep', 'know', 'last', 'least', 'less', 'let', 'like', 'made', 'make', 'many',
  'may', 'me', 'might', 'more', 'most', 'much', 'must', 'my', 'myself', 'need', 'never',
  'new', 'next', 'no', 'none', 'nor', 'not', 'now', 'of', 'off', 'often', 'on', 'once',
  'one', 'only', 'onto', 'or', 'other', 'others', 'our', 'ours', 'out', 'over', 'own',
  'per', 'put', 'quite', 'rather', 'really', 'same', 'see', 'seem', 'seen', 'set', 'shall',
  'she', 'should', 'since', 'so', 'some', 'someone', 'something', 'still', 'such', 'take',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  'therefore', 'these', 'they', 'thing', 'things', 'this', 'those', 'though', 'through',
  'thus', 'to', 'together', 'too', 'toward', 'under', 'until', 'up', 'upon', 'us', 'use',
  'used', 'using', 'very', 'was', 'way', 'we', 'well', 'went', 'were', 'what', 'when',
  'where', 'whether', 'which', 'while', 'who', 'whom', 'whose', 'why', 'will', 'with',
  'within', 'without', 'would', 'yet', 'you', 'your', 'yours', 'yourself',
]);

/** Small sample used for language detection. */
export const LANG_MARKERS_EN = [
  'the', 'of', 'and', 'to', 'in', 'is', 'that', 'it', 'for', 'with', 'as', 'was',
  'on', 'are', 'this', 'be', 'from', 'at', 'by', 'not', 'have', 'has', 'you', 'they',
];

export default STOPWORDS_EN;
