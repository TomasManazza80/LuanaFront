"use client"

import { useState } from "react"
import { MapPicker } from "./map-picker"
import { Image as ImageIcon } from "lucide-react"

export function PropertyForm() {
  const [loading, setLoading] = useState(false)
  const [syncPortals, setSyncPortals] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null)
  const [fileCount, setFileCount] = useState(0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget);
    
    // Add syncPortals explicitly to formData
    formData.append("syncPortals", syncPortals.toString());
    
    if (coordinates) {
      formData.append("latitude", coordinates.lat.toString());
      formData.append("longitude", coordinates.lng.toString());
    }
    
    try {
      const response = await fetch("http://localhost:5000/api/properties", {
        method: "POST",
        body: formData, // Enviar FormData nativo (sin content-type, el navegador pone multipart/form-data automático)
      })

      if (response.ok) {
        setMessage({ text: "Propiedad creada y enviada exitosamente a los portales.", type: "success" })
        e.currentTarget.reset()
      } else {
        const err = await response.json()
        setMessage({ text: err.error || "Error al crear la propiedad", type: "error" })
      }
    } catch (error) {
      setMessage({ text: "Error de red al conectar con el servidor local", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 shadow-xl">
      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.type === "success" ? "bg-green-900/30 text-green-400 border border-green-800" : "bg-red-900/30 text-red-400 border border-red-800"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-zinc-300">Título de Publicación</label>
            <input required id="title" name="title" type="text" className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C7A15E]" placeholder="Ej: Hermosa casa en el centro" />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-zinc-300">Dirección</label>
            <input required id="address" name="address" type="text" className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C7A15E]" placeholder="Ej: Av. San Martín 1234" />
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium text-zinc-300">Tipo de Operación</label>
            <select required id="type" name="type" className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C7A15E]">
              <option value="Venta">Venta</option>
              <option value="Alquiler">Alquiler</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="propertyType" className="text-sm font-medium text-zinc-300">Tipo de Inmueble</label>
            <select required id="propertyType" name="propertyType" className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C7A15E]">
              <option value="Casa">Casa</option>
              <option value="Departamento">Departamento</option>
              <option value="Terreno">Terreno</option>
              <option value="Oficina">Oficina</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium text-zinc-300">Precio (USD)</label>
            <input required id="price" name="price" type="number" className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C7A15E]" placeholder="Ej: 150000" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-zinc-300">Imágenes (Máx 40)</label>
            <div className="relative border-2 border-dashed border-zinc-700/80 rounded-lg p-16 text-center hover:bg-zinc-800/50 transition-colors cursor-pointer group bg-zinc-900/50">
              <input 
                id="images" 
                name="images" 
                type="file" 
                multiple 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={(e) => setFileCount(e.target.files?.length || 0)}
              />
              <div className="flex flex-col items-center justify-center gap-4 text-zinc-500 group-hover:text-[#C7A15E] transition-colors">
                <ImageIcon size={56} className="opacity-70" strokeWidth={1.5} />
                <span className="font-black tracking-[0.2em] text-xs uppercase text-zinc-400 group-hover:text-[#C7A15E] transition-colors">
                  Subir Archivos
                </span>
                {fileCount > 0 && (
                  <span className="mt-2 px-3 py-1 bg-[#C7A15E]/10 text-[#C7A15E] rounded-full text-xs font-semibold">
                    {fileCount} archivo(s) seleccionado(s)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="beds" className="text-sm font-medium text-zinc-300">Habitaciones</label>
            <input required id="beds" name="beds" type="number" min="0" className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C7A15E]" />
          </div>
          <div className="space-y-2">
            <label htmlFor="baths" className="text-sm font-medium text-zinc-300">Baños</label>
            <input required id="baths" name="baths" type="number" min="0" className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C7A15E]" />
          </div>
          <div className="space-y-2">
            <label htmlFor="sqft" className="text-sm font-medium text-zinc-300">Sup. Total (m2)</label>
            <input required id="sqft" name="sqft" type="number" min="0" className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C7A15E]" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="features" className="text-sm font-medium text-zinc-300">Características (Separadas por coma)</label>
          <input id="features" name="features" type="text" className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C7A15E]" placeholder="Ej: Pileta, Quincho, Balcón" />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-zinc-300">Descripción Larga</label>
          <textarea required id="description" name="description" rows={5} className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C7A15E]" placeholder="Describe el inmueble en detalle..."></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Ubicación Exacta en el Mapa (Opcional)</label>
          <p className="text-xs text-zinc-400 mb-2">Haz clic en el mapa para marcar el punto exacto de la propiedad. Esto se mostrará a los clientes.</p>
          <MapPicker onPositionChange={(lat, lng) => setCoordinates({ lat, lng })} />
        </div>

        <div className="flex items-center space-x-3 bg-zinc-800/50 p-4 rounded-md border border-zinc-700">
          <button
            type="button"
            onClick={() => setSyncPortals(!syncPortals)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${syncPortals ? 'bg-[#C7A15E]' : 'bg-zinc-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${syncPortals ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Sincronizar con Portales Externos</span>
            <span className="text-xs text-zinc-400">Si está encendido, se enviará a GVAmax, Zonaprop y Argenprop. Si está apagado, solo se guarda en la base de datos local.</span>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#C7A15E] hover:bg-[#b8923f] text-black font-bold py-4 rounded-md transition-all duration-300 disabled:opacity-50"
        >
          {loading ? "Procesando..." : (syncPortals ? "Guardar y Publicar en Portales" : "Guardar Solo Local")}
        </button>
      </form>
    </div>
  )
}
