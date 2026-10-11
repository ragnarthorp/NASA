'use strict';
/* Markdown: einn þáttari fyrir vefinn (HTML) og PDF-skjalið (sama AST).
   Blokkir: fyrirsagnir (#), efnisgreinar (línuskil haldast), listar (-, *, +, 1. / 1), hreiðraðir með inndrætti),
   tilvitnanir (>), lárétt lína (---), kóðablokkir (```).
   Innan línu: **feitt**, *skáletrað*, ***bæði***, ~~yfirstrikað~~, `kóði`, [tengill](https://…), \* lausnarstafur. */
const mdEscHTML=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function inlineMD(s){
  const held=[];const stash=h=>{held.push(h);return ''+(held.length-1)+'';};
  let x=String(s??'').replace(/\\([\\`*_~\[\]()#+\-.!>|{}])/g,(_,c)=>stash(mdEscHTML(c)));
  x=mdEscHTML(x);
  x=x.replace(/`([^`]+)`/g,(_,v)=>stash('<code>'+v+'</code>'));
  x=x.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,(_,l,u)=>stash('<a href="'+u+'" target="_blank" rel="noopener noreferrer">')+l+stash('</a>'));
  x=x.replace(/(^|[\s(])(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g,(_,p,u)=>p+stash('<a href="'+u+'" target="_blank" rel="noopener noreferrer">'+u+'</a>'));
  x=x.replace(/\*\*\*(?=\S)([^*]*?\S)\*\*\*/g,'<strong><em>$1</em></strong>');
  x=x.replace(/\*\*(?=\S)([^*]*?\S)\*\*/g,'<strong>$1</strong>');
  x=x.replace(/(?<![\p{L}\p{N}_])__(?=\S)([^_]*?\S)__(?![\p{L}\p{N}_])/gu,'<strong>$1</strong>');
  x=x.replace(/~~(?=\S)([^~]*?\S)~~/g,'<s>$1</s>');
  x=x.replace(/\*(?=\S)([^*]*?\S)\*/g,'<em>$1</em>');
  x=x.replace(/(?<![\p{L}\p{N}_])_(?=\S)([^_]*?\S)_(?![\p{L}\p{N}_])/gu,'<em>$1</em>');
  return x.replace(/(\d+)/g,(_,i)=>held[+i]);
}

const MD_LIST=/^( *)([-*+]|\d{1,9}[.)])[ ]+(.*)$/;
const MD_HR=/^ {0,3}([-*_])( *\1){2,} *$/;
const mdIndent=l=>l.match(/^ */)[0].length;
const mdBlockStart=l=>/^ {0,3}(#{1,6} |>|```)/.test(l)||MD_HR.test(l)||MD_LIST.test(l);

function parseMD(src){return mdBlocks(String(src??'').replace(/\r\n?/g,'\n').replace(/\t/g,'    ').split('\n'));}
function mdBlocks(lines){
  const out=[];let i=0,m;
  while(i<lines.length){
    const line=lines[i];
    if(!line.trim()){i++;continue;}
    if(/^ {0,3}```/.test(line)){const buf=[];i++;while(i<lines.length&&!/^ {0,3}```/.test(lines[i]))buf.push(lines[i++]);i++;out.push({type:'code',text:buf.join('\n')});continue;}
    if((m=line.match(/^ {0,3}(#{1,6}) +(.*?)(?: +#+)? *$/))){out.push({type:'h',level:Math.min(3,m[1].length),text:m[2]});i++;continue;}
    if(MD_HR.test(line)){out.push({type:'hr'});i++;continue;}
    if(/^ {0,3}>/.test(line)){const buf=[];while(i<lines.length&&lines[i].trim()&&/^ {0,3}>/.test(lines[i]))buf.push(lines[i++].replace(/^ {0,3}> ?/,''));out.push({type:'quote',blocks:mdBlocks(buf)});continue;}
    if(MD_LIST.test(line)){const r=mdList(lines,i);out.push(r.block);i=r.next;continue;}
    const buf=[];
    while(i<lines.length&&lines[i].trim()&&(!buf.length||!mdBlockStart(lines[i])))buf.push(lines[i++].trim());
    out.push({type:'p',lines:buf});
  }
  return out;
}
function mdList(lines,start){
  const f=lines[start].match(MD_LIST),indent=f[1].length,ordered=/\d/.test(f[2]);
  const block={type:'list',ordered,start:ordered?parseInt(f[2],10):1,items:[]};
  let i=start;
  while(i<lines.length){
    const m=lines[i].match(MD_LIST);
    if(!m||Math.abs(m[1].length-indent)>1||/\d/.test(m[2])!==ordered)break;
    const content=[m[3]],inner=m[1].length+m[2].length+1;i++;
    while(i<lines.length){
      const l=lines[i];
      if(!l.trim()){
        let j=i+1;while(j<lines.length&&!lines[j].trim())j++;
        if(j<lines.length&&mdIndent(lines[j])>indent+1){content.push('');i=j;continue;}
        if(j<lines.length){const n=lines[j].match(MD_LIST);if(n&&Math.abs(n[1].length-indent)<=1&&/\d/.test(n[2])===ordered){i=j;}}
        break;
      }
      if(mdIndent(l)>indent+1){content.push(l.slice(Math.min(mdIndent(l),inner)));i++;continue;}
      if(!mdBlockStart(l)){content.push(l.trim());i++;continue;}
      break;
    }
    block.items.push({blocks:mdBlocks(content)});
    if(i<lines.length&&!lines[i].trim())break;
  }
  return {block,next:i};
}
function mdHTML(blocks,tight=false){
  return blocks.map(b=>{
    switch(b.type){
      case 'h':return `<h${b.level}>${inlineMD(b.text)}</h${b.level}>`;
      case 'p':{const h=b.lines.map(inlineMD).join('<br>');return tight?h:'<p>'+h+'</p>';}
      case 'hr':return '<hr>';
      case 'code':return '<pre><code>'+mdEscHTML(b.text)+'</code></pre>';
      case 'quote':return '<blockquote>'+mdHTML(b.blocks)+'</blockquote>';
      case 'list':{const t=b.ordered?'ol':'ul';return `<${t}${b.ordered&&b.start!==1?` start="${b.start}"`:''}>${b.items.map(it=>'<li>'+mdHTML(it.blocks,it.blocks.length===1||it.blocks[0]?.type==='p')+'</li>').join('')}</${t}>`;}
    }
    return '';
  }).join(tight?'':'');
}
function markdown(s){return mdHTML(parseMD(s));}
/* Texti án markdown-tákna, t.d. fyrir síðuheiti. */
function mdPlain(s){const d=document.createElement('div');d.innerHTML=inlineMD(s);return d.textContent;}
