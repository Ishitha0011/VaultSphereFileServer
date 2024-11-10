// String to slug from https://gist.github.com/hagemann/382adfc57adbd5af078dc93feef01fe1#file-slugify-js
export const nameToSlug = (name: string) => {
  const a = `àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűų
    ẃẍÿýžźż·/_,:;`;
  const b = `aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuu
    wxyyzzz------`;
  const p = new RegExp(a.split("").join("|"), "g");

  return name
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w-]+/g, "") // Remove all non-word characters
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};
