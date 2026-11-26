const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const htmlFiles = ['index.html', 'colaboradores.html', 'identidade-corporativa.html'];
const errors = [];
const results = [];

const getAttributes = (tag) => {
  const attributes = new Map();
  for (const match of tag.matchAll(/([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    attributes.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attributes;
};

const stripFragment = (value) => value.split('#', 1)[0].split('?', 1)[0];

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const ids = [...source.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const idSet = new Set(ids);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) errors.push(`${file}: IDs duplicados: ${[...new Set(duplicateIds)].join(', ')}`);

  const images = [...source.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  images.forEach((tag, index) => {
    const attrs = getAttributes(tag);
    if (!attrs.has('alt')) errors.push(`${file}: imagem ${index + 1} sem alt`);
    if (!attrs.has('width') || !attrs.has('height')) errors.push(`${file}: imagem ${index + 1} sem width/height`);
  });

  for (const match of source.matchAll(/\saria-labelledby="([^"]+)"/g)) {
    for (const id of match[1].trim().split(/\s+/)) {
      if (!idSet.has(id)) errors.push(`${file}: aria-labelledby aponta para ID inexistente: ${id}`);
    }
  }

  const jsonBlocks = [...source.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  jsonBlocks.forEach((match, index) => {
    try { JSON.parse(match[1]); }
    catch (error) { errors.push(`${file}: JSON-LD ${index + 1} inválido: ${error.message}`); }
  });

  const refs = [];
  for (const match of source.matchAll(/<(?:a|link|script|img|iframe)\b[^>]*>/gi)) {
    const attrs = getAttributes(match[0]);
    for (const name of ['href', 'src']) if (attrs.get(name)) refs.push(attrs.get(name));
    if (attrs.get('srcset')) {
      refs.push(...attrs.get('srcset').split(',').map((part) => part.trim().split(/\s+/, 1)[0]));
    }
  }
  for (const ref of refs) {
    if (/^(?:https?:|tel:|mailto:|data:|#)/i.test(ref)) continue;
    if (/^(?:file:|[a-z]:[\\/]|\\\\)/i.test(ref)) {
      errors.push(`${file}: caminho local absoluto: ${ref}`);
      continue;
    }
    const clean = decodeURIComponent(stripFragment(ref));
    if (clean && !fs.existsSync(path.resolve(root, clean))) errors.push(`${file}: referência local inexistente: ${ref}`);
    if (ref.includes('#')) {
      const [targetFile, fragment] = ref.split('#');
      const targetSource = targetFile ? fs.readFileSync(path.resolve(root, targetFile), 'utf8') : source;
      if (fragment && !new RegExp(`\\sid=["']${fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`).test(targetSource)) {
        errors.push(`${file}: fragmento inexistente: ${ref}`);
      }
    }
  }

  const currentPages = [...source.matchAll(/aria-current="page"/g)].length;
  if (currentPages !== 1) errors.push(`${file}: esperado 1 aria-current=page; encontrado ${currentPages}`);

  for (const match of source.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) {
    const attrs = getAttributes(match[0]);
    const rel = attrs.get('rel') ?? '';
    if (!rel.includes('noopener') || !rel.includes('noreferrer')) errors.push(`${file}: target=_blank sem rel seguro`);
  }

  results.push(`${file}: ${images.length} imagens, ${ids.length} IDs, ${jsonBlocks.length} JSON-LD`);
}

const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
if (!script.includes('new-window-hint') || !script.includes('abre em nova aba')) {
  errors.push('script.js: links em nova aba não recebem indicação acessível consistente');
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(results.join('\n'));
  console.log('Validação estática concluída sem erros.');
}
