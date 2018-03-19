export function mixPreview(item) {
  return `
# ${item.title || '这是您的文章预览'}

${item.public || ''}

---------

${item.private || ''}
`;
}

export function decode(txhash, item) {
  return {
    transaction: txhash,
    id: item.events[0].value,
    tagid: item.events[1].value,
    geoid: item.events[2].value,
    title: item.events[3].value,
    hash: item.events[4].value,
    secret: item.events[5].value,
    tag: item.events[6].value,
    geohash: item.events[7].value,
  };
}
