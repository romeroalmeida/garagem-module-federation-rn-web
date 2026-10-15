import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Fronteiras = { visivel: boolean; alternar: () => void }

const ContextoFronteiras = createContext<Fronteiras>({ visivel: false, alternar: () => {} })

// ponytail: estado só em memória — AsyncStorage não está instalado; reabrir o app volta para escondido
export function FronteirasProvider({ children }: { children: ReactNode }) {
  const [visivel, setVisivel] = useState(false)
  const alternar = useCallback(() => setVisivel((v) => !v), [])
  const valor = useMemo(() => ({ visivel, alternar }), [visivel, alternar])
  return <ContextoFronteiras.Provider value={valor}>{children}</ContextoFronteiras.Provider>
}

export function useFronteiras() {
  return useContext(ContextoFronteiras)
}

type Props = {
  nome: string
  /** flex: 1 — só para a busca, que ocupa a tela; dentro de ScrollView o flex: 1 colapsa para altura zero */
  preencher?: boolean
  children: ReactNode
}

/** Só visual: mostra no estudo onde termina o host e começa cada remote — escondida até ligar o botão MF. */
export function Fronteira({ nome, preencher = false, children }: Props) {
  const { visivel } = useFronteiras()
  // escondida, mantém só o flex: sem ele a busca colapsa
  if (!visivel) return <View style={preencher ? estilos.preencher : undefined}>{children}</View>
  return (
    <View style={[estilos.borda, preencher && estilos.preencher]}>
      <Text style={estilos.etiqueta}>remote: {nome}</Text>
      {children}
    </View>
  )
}

const estilos = StyleSheet.create({
  borda: { margin: 8, borderWidth: 2, borderStyle: 'dashed', borderColor: '#7c3aed', borderRadius: 8 },
  preencher: { flex: 1 },
  etiqueta: { alignSelf: 'flex-start', margin: 6, fontSize: 12, fontWeight: '600', color: '#7c3aed' },
})
