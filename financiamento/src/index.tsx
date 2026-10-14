// Fronteira assíncrona: dá tempo do runtime do MF negociar react/react-dom
// antes de qualquer import deles (senão: "Shared module is not available for eager consumption").
import('./bootstrap')
