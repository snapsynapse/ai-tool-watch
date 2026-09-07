'use strict';
function withoutHidden(html) {
    const stack = [], output = [];
    const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
    for (const token of String(html).match(/<[^>]*>|[^<]+/g) || []) {
        const close = token.match(/^<\/\s*([a-z][\w-]*)/i);
        if (close) {
            const name = close[1].toLowerCase(), index = stack.map(s => s.name).lastIndexOf(name);
            if (index >= 0) stack.splice(index);
            if (!stack.some(s => s.hidden)) output.push(token);
            continue;
        }
        const open = token.match(/^<\s*([a-z][\w-]*)/i);
        if (open) {
            const name = open[1].toLowerCase();
            const hidden = stack.some(s => s.hidden) || name === 'template' || /\shidden(?:\s|=|>)/i.test(token) || /\saria-hidden\s*=\s*["']?true/i.test(token) || /\sstyle\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden)/i.test(token);
            if (!voidTags.has(name) && !/\/\s*>$/.test(token)) stack.push({ name, hidden });
            if (!hidden) output.push(token);
        } else if (!stack.some(s => s.hidden)) output.push(token);
    }
    return output.join('');
}
function visibleText(html) {
    return withoutHidden(String(html).replace(/<(script|style|nav|header|footer|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')).replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<(script|style|nav|header|footer|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
        .replace(/<(?:br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section)\b[^>]*>/gi, '\n')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&#(?:x([a-f\d]+)|(\d+));/gi, (all, hex, decimal) => {
            const code = parseInt(hex || decimal, hex ? 16 : 10);
            return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ' ';
        })
        .replace(/&(amp|lt|gt|quot|apos|nbsp|ndash|mdash|rsquo|lsquo|rdquo|ldquo);/gi, (_, key) => ({ amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',ndash:'–',mdash:'—',rsquo:"'",lsquo:"'",rdquo:'"',ldquo:'"' })[key.toLowerCase()])
        .replace(/[\t \r\u00a0]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{2,}/g, '\n').trim();
}
module.exports = { visibleText };
