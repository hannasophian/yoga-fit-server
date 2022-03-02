export default function isFromWebsite(url: string): Boolean {
  const regex = /yoga-fit.netlify.app/;

  const fromWebsite = regex.test(url);
  return fromWebsite;
}
