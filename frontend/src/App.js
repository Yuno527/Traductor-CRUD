import React, { useEffect, useState } from 'react';
import axios from './api';
import './App.css';

function App() {
  const [palabras, setPalabras] = useState([]);
  const [formulario, setFormulario] = useState({
    palabra_origen: '',
    palabra_traducida: '',
    idioma_origen: 'es',
    idioma_destino: 'en'
  });
  const [idEditando, setIdEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [traduccionEncontrada, setTraduccionEncontrada] = useState(''); // 👈 almacena la traducción mostrada

  const obtenerPalabras = async () => {
    const res = await axios.get(`/palabras`, { params: busqueda ? { q: busqueda } : {} });
    setPalabras(res.data);
  };

  useEffect(() => { obtenerPalabras(); }, []);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (idEditando) {
      await axios.put(`/palabras/${idEditando}`, formulario);
      setIdEditando(null);
    } else {
      await axios.post('/palabras', formulario);
    }
    setFormulario({
      palabra_origen: '',
      palabra_traducida: '',
      idioma_origen: 'es',
      idioma_destino: 'en'
    });
    obtenerPalabras();
  };

  const manejarEdicion = (p) => {
    setFormulario({
      palabra_origen: p.palabra_origen,
      palabra_traducida: p.palabra_traducida,
      idioma_origen: p.idioma_origen,
      idioma_destino: p.idioma_destino
    });
    setIdEditando(p.id);
  };

  const manejarEliminacion = async (id) => {
    if (!window.confirm('¿Deseas eliminar esta palabra?')) return;
    await axios.delete(`/palabras/${id}`);
    obtenerPalabras();
  };

  // 🔍 Buscar traducción en la BD cada vez que se escribe algo
  const buscarTraduccion = async (valor) => {
    setBusqueda(valor);
    if (valor.trim() === '') {
      setTraduccionEncontrada('');
      return;
    }

    try {
      // hacemos una búsqueda en el backend
      const res = await axios.get('/palabras', { params: { q: valor } });
      if (res.data.length > 0) {
        // tomamos la primera coincidencia
        const palabra = res.data[0];
        setTraduccionEncontrada(palabra.palabra_traducida);
      } else {
        setTraduccionEncontrada('No encontrada');
      }
    } catch (error) {
      console.error('Error al buscar la traducción:', error);
      setTraduccionEncontrada('Error');
    }
  };

  return (
    <div className="App">
      <h1>Traductor - CRUD - React</h1>

      <div className="buscador">
        <input
          type="text"
          placeholder="Ingresar palabra"
          value={busqueda}
          onChange={(e) => buscarTraduccion(e.target.value)}
        />
        <button onClick={obtenerPalabras}>Traduciendo</button>
        <input
          type="text"
          placeholder="Palabra traducida"
          value={traduccionEncontrada}
          readOnly
        />
      </div>

      {/* 📝 Formulario */}
      <form onSubmit={manejarEnvio}>
        <input
          required
          placeholder="Palabra original"
          value={formulario.palabra_origen}
          onChange={(e) => setFormulario({ ...formulario, palabra_origen: e.target.value })}
        />
        <input
          required
          placeholder="Traducción"
          value={formulario.palabra_traducida}
          onChange={(e) => setFormulario({ ...formulario, palabra_traducida: e.target.value })}
        />
        <select
          value={formulario.idioma_origen}
          onChange={(e) => setFormulario({ ...formulario, idioma_origen: e.target.value })}
        >
          <option value="es">Español</option>
          <option value="en">Inglés</option>
          <option value="fr">Francés</option>
        </select>
        <select
          value={formulario.idioma_destino}
          onChange={(e) => setFormulario({ ...formulario, idioma_destino: e.target.value })}
        >
          <option value="en">Inglés</option>
          <option value="es">Español</option>
          <option value="fr">Francés</option>
        </select>

        <button type="submit">
          {idEditando ? 'Actualizar' : 'Registrar'}
        </button>

        {idEditando && (
          <button
            type="button"
            onClick={() => {
              setIdEditando(null);
              setFormulario({
                palabra_origen: '',
                palabra_traducida: '',
                idioma_origen: 'es',
                idioma_destino: 'en'
              });
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Original</th>
            <th>Traducción</th>
            <th>Idiomas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {palabras.length === 0 ? (
            <tr>
              <td colSpan="6">No hay palabras registradas</td>
            </tr>
          ) : (
            palabras.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.palabra_origen}</td>
                <td>{p.palabra_traducida}</td>
                <td>
                  {p.idioma_origen} → {p.idioma_destino}
                </td>
                <td>
                  <button onClick={() => manejarEdicion(p)}>Editar</button>
                  <button onClick={() => manejarEliminacion(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
