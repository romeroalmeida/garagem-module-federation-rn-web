/** Entrada mínima de 20% e máxima de 90% do preço, em reais inteiros (conta inteira, sem 0.2 em ponto flutuante). */
export function limitesEntrada(preco: number): { min: number; max: number } {
  return { min: Math.ceil((preco * 20) / 100), max: Math.floor((preco * 90) / 100) }
}

/** true = definida e dentro de [min, max]. No ramo false o TS estreita `entrada` para `undefined`,
 *  mas ela pode ser um número fora do limite — não confie nesse estreitamento. */
export function entradaValida(entrada: number | undefined, preco: number): entrada is number {
  const { min, max } = limitesEntrada(preco)
  return entrada !== undefined && entrada >= min && entrada <= max
}

/** Texto digitado → número; descarta o que não é dígito. Vazio = undefined. */
export function lerNumero(texto: string): number | undefined {
  const digitos = texto.replace(/\D/g, '')
  return digitos === '' ? undefined : Number(digitos)
}

/** Atalho dos chips de entrada (20%, 30%…): mesmo arredondamento do mínimo. */
export function entradaPorPercentual(preco: number, percentual: number): number {
  return Math.ceil((preco * percentual) / 100)
}
