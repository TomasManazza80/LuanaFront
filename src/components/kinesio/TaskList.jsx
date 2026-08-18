import React, { useState } from 'react';
import { Calendar, CalendarClock, CheckCircle2, Circle, Clock, PlusCircle, Check, AlertCircle } from 'lucide-react';

const TaskList = () => {
  const [newTask, setNewTask] = useState('');

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#F8FAFC] p-3 md:p-5 flex flex-col gap-4 font-sans">
      
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#111827]">Tareas</h1>
          <p className="text-xs text-gray-500 mt-0.5">Gestiona tus prioridades diarias.</p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full md:w-56">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-gray-700">Progreso Diario</span>
            <span className="text-xs font-bold text-[#0A58CA]">65%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-[#0A58CA] h-1.5 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>
      </div>

      {/* Add Task Input Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-2.5 shadow-xs flex items-center gap-2.5">
        <div className="text-gray-400 pl-1">
          <PlusCircle size={18} />
        </div>
        <input 
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Agregar nueva tarea..."
          className="flex-1 bg-transparent border-none text-gray-700 focus:outline-none focus:ring-0 text-xs font-medium"
        />
        <button className="bg-[#0A58CA] hover:bg-blue-700 text-white px-4 py-1.5 rounded-full font-bold shadow-xs transition-colors text-xs">
          Agregar
        </button>
      </div>

      {/* Today Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-[#4F46E5]">
            <Calendar size={18} strokeWidth={2.5} />
            <h2 className="text-base font-bold text-gray-900">Hoy</h2>
          </div>
          <span className="bg-[#EDE9FE] text-[#6D28D9] w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">
            3
          </span>
        </div>

        <div className="flex flex-col gap-5">
          {/* Task 1 */}
          <div className="flex items-start gap-4">
            <div className="mt-0.5 text-gray-300 hover:text-gray-400 cursor-pointer">
              <div className="w-5 h-5 rounded border-2 border-gray-300"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Llamar al Cliente X sobre recordatorio de turno</p>
              <div className="flex items-center gap-1.5 mt-1 text-[#EF4444]">
                <AlertCircle size={14} />
                <span className="text-xs font-bold">Alta Prioridad</span>
              </div>
            </div>
          </div>

          {/* Task 2 */}
          <div className="flex items-start gap-4">
            <div className="mt-0.5 text-gray-300 hover:text-gray-400 cursor-pointer">
              <div className="w-5 h-5 rounded border-2 border-gray-300"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Revisar resultados de laboratorio del Sr. Smith</p>
              <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                <Clock size={14} />
                <span className="text-xs font-semibold">2:00 PM</span>
              </div>
            </div>
          </div>

          {/* Task 3 */}
          <div className="flex items-start gap-4">
            <div className="mt-0.5 text-gray-300 hover:text-gray-400 cursor-pointer">
              <div className="w-5 h-5 rounded border-2 border-gray-300"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Consulta con el Dr. Lee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid for Upcoming and Completed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upcoming Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[#059669] mb-6">
            <CalendarClock size={22} strokeWidth={2.5} />
            <h2 className="text-lg font-bold text-gray-900">Próximas</h2>
          </div>
          
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 text-gray-300 hover:text-gray-400 cursor-pointer">
                <div className="w-5 h-5 rounded border-2 border-gray-300"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Actualizar inventario</p>
                <p className="text-xs font-semibold text-gray-500 mt-1">Mañana</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-0.5 text-gray-300 hover:text-gray-400 cursor-pointer">
                <div className="w-5 h-5 rounded border-2 border-gray-300"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Preparar reporte mensual</p>
                <p className="text-xs font-semibold text-gray-500 mt-1">Viernes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-6">
            <CheckCircle2 size={22} strokeWidth={2.5} />
            <h2 className="text-lg font-bold text-gray-900">Completadas</h2>
          </div>
          
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 text-[#10B981]">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400 line-through">Reunión matutina del equipo</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-0.5 text-[#10B981]">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400 line-through">Revisar signos vitales nocturnos</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default TaskList;
