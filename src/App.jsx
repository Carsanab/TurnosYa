import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Sparkles, CheckCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    servicio: '',
    fecha: '',
    hora: ''
  });

  const [mapaServicios, setMapaServicios] = useState({});
  const [numeroWhatsapp, setNumeroWhatsapp] = useState('');
  const [ocupados, setOcupados] = useState([]);
  const [cargandoInicio, setCargandoInicio] = useState(true);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // 1. Cargar servicios, horarios y el número de WhatsApp desde Google Sheets
  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const res = await fetch(`/.netlify/functions/reservar`);
        const data = await res.json();
        
        if (data.serviciosConHorarios) {
          setMapaServicios(data.serviciosConHorarios);
          const listaNombres = Object.keys(data.serviciosConHorarios);
          if (listaNombres.length > 0) {
            setFormData(prev => ({ ...prev, servicio: listaNombres[0] }));
          }
        }

        if (data.whatsappNegocio) {
          setNumeroWhatsapp(data.whatsappNegocio);
        }
      } catch (error) {
        console.error("Error al cargar configuración", error);
      } finally {
        setCargandoInicio(false);
      }
    };

    cargarConfiguracion();
  }, []);

  // 2. Cargar turnos ocupados cuando se selecciona una fecha
  useEffect(() => {
    if (!formData.fecha) return;

    const cargarHorariosOcupados = async () => {
      setCargandoHorarios(true);
      try {
        const res = await fetch(`/.netlify/functions/reservar?fecha=${formData.fecha}`);
        const data = await res.json();
        setOcupados(data.ocupados || []);
      } catch (error) {
        console.error("Error al obtener turnos ocupados", error);
      } finally {
        setCargandoHorarios(false);
      }
    };

    cargarHorariosOcupados();
  }, [formData.fecha]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'servicio') {
      setFormData({ ...formData, servicio: value, hora: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const seleccionarHora = (hora) => {
    setFormData({ ...formData, hora });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hora) {
      alert("Por favor selecciona un horario disponible.");
      return;
    }

    setLoadingSubmit(true);

    try {
      await fetch('/.netlify/functions/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const mensajeWA = `Hola! Quisiera confirmar mi turno:\n\n` +
        `👤 *Nombre:* ${formData.nombre}\n` +
        `📱 *Teléfono:* ${formData.telefono}\n` +
        `💅 *Servicio:* ${formData.servicio}\n` +
        `📅 *Fecha:* ${formData.fecha}\n` +
        `⏰ *Hora:* ${formData.hora}`;

      const destino = numeroWhatsapp ? numeroWhatsapp : "5491122334455";
      const urlWhatsApp = `https://wa.me/${destino}?text=${encodeURIComponent(mensajeWA)}`;

      setLoadingSubmit(false);
      window.location.href = urlWhatsApp;

    } catch (error) {
      console.error("Error al registrar la reserva", error);
      alert("Ocurrió un error al guardar tu turno. Intenta nuevamente.");
      setLoadingSubmit(false);
    }
  };

  const horariosDelServicio = mapaServicios[formData.servicio] || [];

  if (cargandoInicio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7E49B]/30">
        <div className="flex items-center gap-2 text-gray-700">
          <Loader2 className="w-6 h-6 animate-spin text-[#BA5A5A]" />
          <span>Cargando servicios y horarios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7E49B]/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-[#86BCBD]/30">
        
        {/* Banner */}
        <div className="bg-[#BA5A5A] p-6 text-white text-center relative">
          <Sparkles className="absolute top-4 right-4 text-[#F7E49B] w-6 h-6 animate-pulse" />
          <h1 className="text-3xl font-bold tracking-wide">TurnoYa</h1>
          <p className="text-sm mt-1 text-[#F7E49B]">Reserva tu cita en pocos segundos</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-[#86BCBD] w-5 h-5" />
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. María Pérez"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BA5A5A] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-[#86BCBD] w-5 h-5" />
              <input
                type="tel"
                name="telefono"
                required
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej. 1122334455"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BA5A5A] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
            <select
              name="servicio"
              value={formData.servicio}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BA5A5A] focus:outline-none bg-white"
            >
              {Object.keys(mapaServicios).map((servicioNombre, idx) => (
                <option key={idx} value={servicioNombre}>{servicioNombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Fecha</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-[#86BCBD] w-5 h-5" />
              <input
                type="date"
                name="fecha"
                required
                value={formData.fecha}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BA5A5A] focus:outline-none"
              />
            </div>
          </div>

          {/* Horarios por servicio */}
          {formData.fecha && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horarios para {formData.servicio}
              </label>
              
              {cargandoHorarios ? (
                <div className="flex items-center justify-center py-4 text-gray-500 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#86BCBD]" />
                  <span className="text-sm">Consultando disponibilidad...</span>
                </div>
              ) : horariosDelServicio.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-2">
                  No hay horarios configurados para este servicio.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {horariosDelServicio.map((hora) => {
                    const estaOcupado = ocupados.includes(hora);
                    const estaSeleccionado = formData.hora === hora;

                    return (
                      <button
                        key={hora}
                        type="button"
                        disabled={estaOcupado}
                        onClick={() => seleccionarHora(hora)}
                        className={`py-2 px-3 text-sm rounded-lg font-medium transition duration-200 border cursor-pointer ${
                          estaOcupado
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                            : estaSeleccionado
                            ? 'bg-[#BA5A5A] text-white border-[#BA5A5A] shadow-md'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#86BCBD]'
                        }`}
                      >
                        {hora}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loadingSubmit || !formData.hora}
            className={`w-full mt-4 text-gray-800 font-bold py-3 px-4 rounded-lg shadow-md transition duration-200 flex items-center justify-center gap-2 ${
              !formData.hora || loadingSubmit
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-[#A4CE8B] hover:bg-[#86BCBD] cursor-pointer'
            }`}
          >
            {loadingSubmit ? (
              <span>Procesando...</span>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Confirmar por WhatsApp</span>
              </>
            )}
          </button>
        </form>

        <div className="bg-gray-50 px-6 py-3 text-center border-t text-xs text-gray-500">
          Atención rápida • Horarios según servicio
        </div>
      </div>
    </div>
  );
}