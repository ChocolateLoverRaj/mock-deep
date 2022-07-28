const scriptText = `
import path from 'path';
export const foo = 'bar';
`.trim();

await import(`data:text/javascript,${scriptText}`); // Wrong, only works by accident if the JS contains no URL special chars.
await import(`data:text/javascript,${encodeURIComponent(scriptText)}`); // Better, works all the times!