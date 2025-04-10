// Archivo validador.js - Código principal de la aplicación

// Componentes principales
const { useState, useRef, useEffect } = React;

// Componente principal de la aplicación
const ValidadorFotos = () => {
  const [imagen, setImagen] = useState(null);
  const [resultados, setResultados] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [historial, setHistorial] = useState(() => {
    // Intentar recuperar historial del localStorage
    const savedHistorial = localStorage.getItem('validador_historial');
    return savedHistorial ? JSON.parse(savedHistorial) : [];
  });
  const [modo, setModo] = useState('individual');
  const [imagenesPendientes, setImagenesPendientes] = useState([]);
  const [mostrarExportar, setMostrarExportar] = useState(false);
  const fileInputRef = useRef(null);
  const inputMultipleRef = useRef(null);

  // Guardar historial en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('validador_historial', JSON.stringify(historial));
  }, [historial]);

  // Simula la detección de problemas en la imagen
  const analizarImagen = (img) => {
    setProcesando(true);
    
    // Simulación del tiempo de procesamiento del análisis
    setTimeout(() => {
      const nuevoResultado = {
        id: Date.now(),
        url: img,
        fecha: new Date().toLocaleString(),
        problemas: {
          logos: true, // Detección de logo Adidas
          gestos: true, // Manos ocultas (gesto inadecuado)
          calidad: Math.random() > 0.6,
          composicion: true, // Cabeza no recta
          otrosElementos: true // Capucha oscura
        },
        detallesLogos: {
          adidas: true,
          nike: false,
          puma: false,
          otros: false
        },
        detallesGestos: {
          manosOcultas: true,
          manosAdelante: false,
          señasInapropiadas: false,
          gestosViolencia: false
        },
        detallesComposicion: {
          cabezaNoRecta: true,
          cabezaCostado: false,
          malEncuadre: false,
          inclinadoAdelante: false,
          malaIluminacion: false
        },
        detallesElementos: {
          capuchaOscura: true,
          objetosInapropiados: false,
          personasNoAutorizadas: false
        },
        estado: 'pendiente'
      };
      
      // Calcular puntuación general basada en problemas encontrados
      const cantidadProblemas = Object.values(nuevoResultado.problemas).filter(val => val).length;
      nuevoResultado.puntuacion = Math.max(0, 100 - (cantidadProblemas * 20));
      
      setResultados(nuevoResultado);
      setProcesando(false);
    }, 1500);
  };

  const manejarCarga = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagen(e.target.result);
        analizarImagen(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const manejarCargaMultiple = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const nuevasImagenes = Array.from(files).map(file => ({
        file,
        id: Date.now() + Math.random(),
        nombre: file.name,
        estado: 'pendiente',
        url: URL.createObjectURL(file)
      }));
      
      setImagenesPendientes([...imagenesPendientes, ...nuevasImagenes]);
    }
  };

  const procesarLote = () => {
    setProcesando(true);
    let pendientes = [...imagenesPendientes];
    
    // Simular proceso por lotes
    setTimeout(() => {
      const procesadas = pendientes.map(img => {
        // En lugar de valores aleatorios, asumimos que estos problemas son detectados en cada imagen
        // En una implementación real, aquí se analizaría cada imagen con modelos de visión por computadora
        const resultadoImg = {
          id: img.id,
          url: img.url,
          nombre: img.nombre,
          fecha: new Date().toLocaleString(),
          problemas: {
            logos: true, // Logos en prendas
            gestos: true, // Problemas de postura de manos
            calidad: false, // Asumimos buena calidad de imagen
            composicion: true, // Problemas de posición y encuadre
            otrosElementos: true // Elementos inadecuados detectados
          },
          detallesLogos: {
            adidas: true, // Logo Adidas detectado
            nike: false,
            puma: false,
            otros: false
          },
          detallesGestos: {
            manosOcultas: false,
            manosAdelante: true, // Nueva detección: manos hacia adelante
            señasInapropiadas: false,
            gestosViolencia: false
          },
          detallesComposicion: {
            cabezaNoRecta: true, // Cabeza inclinada
            cabezaCostado: true, // Nueva detección: mirando de costado
            malEncuadre: true, // Mala ubicación del niño en la foto
            inclinadoAdelante: true, // Nueva detección: inclinado hacia adelante
            malaIluminacion: false
          },
          detallesElementos: {
            capuchaOscura: true,
            objetosInapropiados: false,
            personasNoAutorizadas: false
          },
          estado: Math.random() > 0.7 ? 'aprobada' : (Math.random() > 0.5 ? 'rechazada' : 'cambios')
        };
        
        // Calcular puntuación
        const cantidadProblemas = Object.values(resultadoImg.problemas).filter(val => val).length;
        resultadoImg.puntuacion = Math.max(0, 100 - (cantidadProblemas * 20));
        
        return resultadoImg;
      });
      
      setHistorial([...historial, ...procesadas]);
      setImagenesPendientes([]);
      setProcesando(false);
      setMostrarExportar(true);
    }, 3000);
  };

  const reiniciar = () => {
    setImagen(null);
    setResultados(null);
  };

  const aprobarFoto = () => {
    if (resultados) {
      const nuevoHistorial = [...historial, {...resultados, estado: 'aprobada'}];
      setHistorial(nuevoHistorial);
      reiniciar();
    }
  };

  const rechazarFoto = () => {
    if (resultados) {
      const nuevoHistorial = [...historial, {...resultados, estado: 'rechazada'}];
      setHistorial(nuevoHistorial);
      reiniciar();
    }
  };

  const solicitarCambios = () => {
    if (resultados) {
      const nuevoHistorial = [...historial, {...resultados, estado: 'cambios'}];
      setHistorial(nuevoHistorial);
      reiniciar();
    }
  };

  const exportarInforme = () => {
    // Generar contenido CSV del historial
    let csv = 'ID,Nombre,Fecha,Puntuación,Estado,Problemas\n';
    
    historial.forEach(item => {
      const problemas = Object.entries(item.problemas)
        .filter(([_, valor]) => valor)
        .map(([problema, _]) => problema)
        .join('; ');
      
      csv += `${item.id},"${item.nombre || 'Sin nombre'}","${item.fecha}",${item.puntuacion},"${item.estado}","${problemas}"\n`;
    });
    
    // Crear un enlace para descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `informe_validacion_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generarPDF = () => {
    alert('Informe PDF generado y enviado por correo electrónico.');
    // En una implementación real, aquí se generaría un PDF
  };

  const limpiarHistorial = () => {
    if (confirm('¿Estás seguro de que deseas eliminar todo el historial? Esta acción no se puede deshacer.')) {
      setHistorial([]);
      localStorage.removeItem('validador_historial');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white text-black p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 150" className="h-12 mr-4">
            {/* Figura humana estilizada */}
            <path d="M80,20 C100,20 120,30 120,60 C120,90 100,100 80,100 C60,100 40,90 40,60 C40,30 60,20 80,20 Z" fill="#00845B" />
            <path d="M90,100 L140,180 L40,180 Z" fill="#00845B" transform="translate(-10, -80)" />
            
            {/* Texto "EDUCO" */}
            <path d="M170,70 C170,55 180,40 200,40 C220,40 230,55 230,70 L170,70 Z M170,80 L230,80 C230,95 220,110 200,110 C180,110 170,95 170,80 Z" fill="#00845B" />
            <path d="M240,45 L240,105 L260,105 L260,45 Z" fill="#00845B" />
            <path d="M270,45 L270,105 L290,105 C290,75 320,75 320,45 L270,45 Z" fill="#00845B" />
            <path d="M330,70 C330,55 340,40 360,40 C380,40 390,55 390,70 L330,70 Z M330,80 L390,80 C390,95 380,110 360,110 C340,110 330,95 330,80 Z" fill="#00845B" />
            <path d="M400,70 C400,55 410,40 430,40 C450,40 460,55 460,70 L400,70 Z M400,80 L460,80 C460,95 450,110 430,110 C410,110 400,95 400,80 Z" fill="#00845B" />
            
            {/* Texto "educar cura" */}
            <text x="250" y="140" fontFamily="Arial, sans-serif" fontSize="24" fill="black" textAnchor="middle">educar cura</text>
          </svg>
          <div>
            <h1 className="text-2xl font-bold text-green-700">Validador de Fotografías para Apadrinamiento</h1>
            <p className="text-gray-600">Sistema de revisión y validación automática de imágenes</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => alert('Manual del usuario disponible en el menú de ayuda.')} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2">
            <span>Manual de usuario</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 p-4 gap-4">
        {/* Selector de modo */}
        <div className="w-full bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Modo de trabajo</h2>
              <p className="text-sm text-gray-600">Selecciona cómo quieres procesar las imágenes</p>
            </div>
            <div className="flex">
              <button 
                onClick={() => setModo('individual')}
                className={`px-4 py-2 rounded-l-md ${modo === 'individual' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Individual
              </button>
              <button 
                onClick={() => setModo('lote')}
                className={`px-4 py-2 rounded-r-md ${modo === 'lote' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Por lotes
              </button>
            </div>
          </div>
        </div>
      </div>

      {modo === 'individual' ? (
        <div className="flex flex-col md:flex-row flex-1 p-4 gap-4">
          {/* Panel izquierdo: Carga y vista previa */}
          <div className="w-full md:w-1/2 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Cargar y Previsualizar</h2>
          
            {!imagen ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                onClick={() => fileInputRef.current.click()}
              >
                <span className="lucide lucide-upload text-green-500 mb-4" style={{fontSize: '48px'}}></span>
                <p className="text-gray-500 text-center">Haz clic para cargar una fotografía o arrastra y suelta aquí</p>
                <p className="text-sm text-gray-400 mt-2">Formatos aceptados: JPG, PNG (máx. 10MB)</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={manejarCarga} 
                  className="hidden" 
                  accept="image/jpeg, image/png" 
                />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative mb-4 rounded-lg overflow-hidden shadow-md">
                  <img src={imagen} alt="Previsualización" className="max-w-full h-auto" style={{maxHeight: '400px'}} />
                </div>
                <button 
                  onClick={reiniciar} 
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  <span className="lucide lucide-refresh-cw" style={{fontSize: '18px'}}></span>
                  <span>Cargar otra fotografía</span>
                </button>
              </div>
            )}
          </div>

          {/* Panel derecho: Resultados */}
          <div className="w-full md:w-1/2 bg-white p-4 rounded-lg shadow-md flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Resultados del Análisis</h2>
          
            {procesando ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                  <p className="text-gray-500">Analizando imagen...</p>
                </div>
              </div>
            ) : !resultados ? (
              <div className="flex-1 flex items-center justify-center">
                {imagen ? (
                  <p className="text-gray-500">Esperando resultados del análisis...</p>
                ) : (
                  <div className="text-center text-gray-500">
                    <span className="lucide lucide-image mx-auto mb-4 text-gray-400" style={{fontSize: '48px'}}></span>
                    <p>Carga una fotografía para comenzar el análisis</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Puntuación general:</span>
                    <div className={`px-2 py-1 rounded-md font-bold ${
                      resultados.puntuacion >= 80 ? 'bg-green-100 text-green-800' : 
                      resultados.puntuacion >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {resultados.puntuacion}/100
                    </div>
                  </div>
                </div>

                <div className="mb-6 space-y-3">
                  <h3 className="font-medium text-gray-700">Criterios evaluados:</h3>
                  <CriterioItem 
                    titulo="Ausencia de logos y marcas comerciales" 
                    cumple={!resultados.problemas.logos}
                    descripcion="Detectar e informar imágenes que contengan logos de empresas deportivas u otras marcas comerciales."
                    detalles={resultados.detallesLogos && resultados.problemas.logos ? (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                        <p className="font-medium text-red-700">Logos detectados:</p>
                        <ul className="list-disc pl-5 pt-1">
                          {resultados.detallesLogos.adidas && <li>Logo de Adidas identificado en prenda</li>}
                          {resultados.detallesLogos.nike && <li>Logo de Nike identificado</li>}
                          {resultados.detallesLogos.puma && <li>Logo de Puma identificado</li>}
                          {resultados.detallesLogos.otros && <li>Otros logos comerciales identificados</li>}
                        </ul>
                      </div>
                    ) : null}
                  />
                  <CriterioItem 
                    titulo="Señales o gestos apropiados" 
                    cumple={!resultados.problemas.gestos}
                    descripcion="Identificar y filtrar fotografías donde las personas realicen señas con las manos que puedan interpretarse como inapropiadas."
                    detalles={resultados.detallesGestos && resultados.problemas.gestos ? (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                        <p className="font-medium text-red-700">Problemas detectados:</p>
                        <ul className="list-disc pl-5 pt-1">
                          {resultados.detallesGestos.manosOcultas && <li>Manos ocultas (posible desafío a la autoridad)</li>}
                          {resultados.detallesGestos.manosAdelante && <li>Manos hacia adelante (postura inadecuada)</li>}
                          {resultados.detallesGestos.señasInapropiadas && <li>Señas inapropiadas identificadas</li>}
                          {resultados.detallesGestos.gestosViolencia && <li>Gestos asociados a violencia o pandillas</li>}
                        </ul>
                      </div>
                    ) : null}
                  />
                  <CriterioItem 
                    titulo="Buena resolución y calidad" 
                    cumple={!resultados.problemas.calidad}
                    descripcion="Verificar que la imagen no esté borrosa, pixelada o en baja resolución."
                  />
                  <CriterioItem 
                    titulo="Centrado y composición adecuada" 
                    cumple={!resultados.problemas.composicion}
                    descripcion="Asegurar que el rostro y la postura del sujeto estén correctamente centrados y bien encuadrados."
                    detalles={resultados.detallesComposicion && resultados.problemas.composicion ? (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                        <p className="font-medium text-red-700">Problemas detectados:</p>
                        <ul className="list-disc pl-5 pt-1">
                          {resultados.detallesComposicion.cabezaNoRecta && <li>Cabeza inclinada</li>}
                          {resultados.detallesComposicion.cabezaCostado && <li>Mirando de costado</li>}
                          {resultados.detallesComposicion.malEncuadre && <li>Mala ubicación del niño en la imagen</li>}
                          {resultados.detallesComposicion.inclinadoAdelante && <li>Inclinado hacia adelante</li>}
                          {resultados.detallesComposicion.malaIluminacion && <li>Problemas de iluminación en el rostro</li>}
                        </ul>
                      </div>
                    ) : null}
                  />
                  <CriterioItem 
                    titulo="Sin elementos perjudiciales" 
                    cumple={!resultados.problemas.otrosElementos}
                    descripcion="Alertar sobre fondos inadecuados, presencia de terceros no autorizados u otros elementos inadecuados."
                    detalles={resultados.detallesElementos && resultados.problemas.otrosElementos ? (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                        <p className="font-medium text-red-700">Elementos inadecuados:</p>
                        <ul className="list-disc pl-5 pt-1">
                          {resultados.detallesElementos.capuchaOscura && <li>Capucha oscura que oculta parcialmente el rostro</li>}
                          {resultados.detallesElementos.objetosInapropiados && <li>Objetos inapropiados en la imagen</li>}
                          {resultados.detallesElementos.personasNoAutorizadas && <li>Personas no autorizadas en el fondo</li>}
                        </ul>
                      </div>
                    ) : null}
                  />
                </div>

                <div className="mt-auto pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={aprobarFoto}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <span className="lucide lucide-check-circle" style={{fontSize: '18px'}}></span>
                      <span>Aprobar</span>
                    </button>
                    <button 
                      onClick={solicitarCambios}
                      className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center justify-center gap-2"
                    >
                      <span className="lucide lucide-refresh-cw" style={{fontSize: '18px'}}></span>
                      <span>Solicitar cambios</span>
                    </button>
                    <button 
                      onClick={rechazarFoto}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <span className="lucide lucide-x-circle" style={{fontSize: '18px'}}></span>
                      <span>Rechazar</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col p-4 gap-4">
          {/* Panel de carga por lotes */}
          <div className="w-full bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Procesamiento por lotes</h2>
            
            <div className="mb-6">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                onClick={() => inputMultipleRef.current.click()}
              >
                <span className="lucide lucide-upload text-green-500 mb-3" style={{fontSize: '36px'}}></span>
                <p className="text-gray-600 text-center">Haz clic para cargar múltiples fotografías</p>
                <p className="text-sm text-gray-400 mt-2">Formatos aceptados: JPG, PNG (máx. 10MB por archivo)</p>
                <input 
                  type="file" 
                  ref={inputMultipleRef} 
                  onChange={manejarCargaMultiple} 
                  className="hidden" 
                  accept="image/jpeg, image/png"
                  multiple
                />
              </div>
            </div>
            
            {/* Lista de imágenes cargadas */}
            {imagenesPendientes.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Imágenes cargadas: {imagenesPendientes.length}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {imagenesPendientes.map(img => (
                    <div key={img.id} className="border rounded-md overflow-hidden bg-gray-50">
                      <img src={img.url} alt={img.nombre} className="w-full h-32 object-cover" />
                      <div className="p-2">
                        <p className="text-xs text-gray-600 truncate" title={img.nombre}>{img.nombre}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <button 
                    onClick={procesarLote}
                    disabled={procesando}
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 disabled:bg-gray-400"
                  >
                    {procesando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Procesando lote...</span>
                      </>
                    ) : (
                      <>
                        <span>Analizar todas las imágenes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {/* Mensaje para cuando no hay imágenes */}
            {imagenesPendientes.length === 0 && !procesando && (
              <p className="text-center text-gray-500 my-4">
                No hay imágenes pendientes por procesar
              </p>
            )}
          </div>
        </div>
      )}

      {/* Historial de revisiones */}
      {historial.length > 0 && (
        <div className="p-4 bg-white m-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Historial de Revisiones</h2>
            <div className="flex gap-2">
              <button 
                onClick={exportarInforme} 
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <span>Exportar CSV</span>
              </button>
              <button 
                onClick={generarPDF} 
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <span>Generar PDF</span>
              </button>
              <button 
                onClick={limpiarHistorial} 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                <span>Limpiar historial</span>
              </button>
              {mostrarExportar && (
                <div className="px-4 py-2 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-md flex items-center">
                  <span>Informe listo para exportar</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miniatura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntuación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problemas</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historial.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img src={item.url} alt="Miniatura" className="h-12 w-16 object-cover rounded" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.puntuacion >= 80 ? 'bg-green-100 text-green-800' : 
                        item.puntuacion >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.puntuacion}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.estado === 'aprobada' ? 'bg-green-100 text-green-800' : 
                        item.estado === 'cambios' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.estado === 'aprobada' ? 'Aprobada' : 
                         item.estado === 'cambios' ? 'Solicitud de cambios' : 'Rechazada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Object.entries(item.problemas)
                        .filter(([_, valor]) => valor)
                        .map(([problema, _]) => {
                          let problemaTexto = {
                            logos: "Logos detectados",
                            gestos: "Gestos inapropiados",
                            calidad: "Baja calidad",
                            composicion: "Mala composición",
                            otrosElementos: "Elementos inadecuados"
                          }[problema];
                          
                          // Especificar detalles específicos según el tipo de problema
                          if (problema === 'logos' && item.detallesLogos) {
                            if (item.detallesLogos.adidas) problemaTexto = "Logo Adidas";
                            else if (item.detallesLogos.nike) problemaTexto = "Logo Nike";
                            else if (item.detallesLogos.puma) problemaTexto = "Logo Puma";
                          }
                          else if (problema === 'gestos' && item.detallesGestos) {
                            if (item.detallesGestos.manosOcultas) problemaTexto = "Manos ocultas";
                            else if (item.detallesGestos.manosAdelante) problemaTexto = "Manos hacia adelante";
                          }
                          else if (problema === 'composicion' && item.detallesComposicion) {
                            if (item.detallesComposicion.cabezaNoRecta) problemaTexto = "Cabeza inclinada";
                            else if (item.detallesComposicion.cabezaCostado) problemaTexto = "Mirando de costado";
                            else if (item.detallesComposicion.malEncuadre) problemaTexto = "Mala ubicación en foto";
                            else if (item.detallesComposicion.inclinadoAdelante) problemaTexto = "Inclinado hacia adelante";
                          }
                          else if (problema === 'otrosElementos' && item.detallesElementos && item.detallesElementos.capuchaOscura) {
                            problemaTexto = "Capucha oscura";
                          }
                          
                          return (
                            <div key={problema} className="text-xs inline-block mr-1 mb-1 px-2 py-1 bg-gray-100 rounded-full">
                              {problemaTexto}
                            </div>
                          );
                        })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para mostrar cada criterio evaluado
const CriterioItem = ({ titulo, cumple, descripcion, detalles }) => {
  return (
    <div className="p-3 rounded-lg border flex items-start gap-3">
      {cumple ? (
        <span className="lucide lucide-check-circle text-green-500 shrink-0 mt-0.5" style={{fontSize: '18px'}}></span>
      ) : (
        <span className="lucide lucide-alert-triangle text-red-500 shrink-0 mt-0.5" style={{fontSize: '18px'}}></span>
      )}
      <div className="w-full">
        <h4 className={`font-medium ${cumple ? 'text-green-700' : 'text-red-700'}`}>{titulo}</h4>
        <p className="text-sm text-gray-600">{descripcion}</p>
        {!cumple && !detalles && (
          <p className="text-sm text-red-600 mt-1 font-medium">Se han detectado problemas con este criterio</p>
        )}
        {detalles}
      </div>
    </div>
  );
};

// Renderizar la aplicación
const domContainer = document.getElementById('root');
ReactDOM.render(React.createElement(ValidadorFotos), domContainer);
