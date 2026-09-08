"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";

export default function Home() {
  // Leer la lista de todos
  const todos = trpc.todo.list.useQuery();
  const utils = trpc.useUtils();

  // Mutaciones (escribir en el server)
  const createTodo = trpc.todo.create.useMutation({
    onSuccess: () => utils.todo.list.invalidate(),
  });
  const updateTodo = trpc.todo.update.useMutation({
    onSuccess: () => utils.todo.list.invalidate(),
  });
  const deleteTodo = trpc.todo.delete.useMutation({
    onSuccess: () => utils.todo.list.invalidate(),
  });

  // Estado del formulario de crear
  const [newTitle, setNewTitle] = useState("");

  // Estado de la edición: el id del todo que se está editando y su texto temporal
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createTodo.mutate({ title: newTitle });
    setNewTitle("");
  };

  const toggleCompleted = (id: number, completed: boolean) => {
    updateTodo.mutate({ id, completed: !completed });
  };

  // Entrar en modo edición de un todo
  const startEditing = (id: number, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  // Guardar el título editado
  const saveEdit = (id: number) => {
    if (!editTitle.trim()) return;
    updateTodo.mutate({ id, title: editTitle });
    setEditingId(null);
  };

  // Cancelar la edición
  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold mb-6">Mi Todo List con TRPC</h1>

      <div className="border rounded-lg p-6">
        <p className="text-lg">Respuesta de tRPC:</p>

        {/* Formulario para crear */}
        <form onSubmit={handleCreate} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Escribe una nueva tarea.."
            className="flex-1 rounded border px-3 py-2"
          />
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white"
            disabled={createTodo.isPending}
          >
            {createTodo.isPending ? "Creando..." : "Crear"}
          </button>
        </form>

        {todos.isLoading && <p className="mt-2">Cargando...</p>}

        {todos.isError && (
          <p className="mt-2 text-red-500">Error: {todos.error.message}</p>
        )}

        {todos.data && (
          <ul className="mt-4 space-y-2">
            {todos.data.map((todo) => (
              <li key={todo.id} className="flex items-center gap-3 rounded border p-3">
                {/* Este es el Checkbox para marcar completado */}
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleCompleted(todo.id, todo.completed)}
                />

                <span className={`flex-1 ${todo.completed ? "line-through text-gray-400" : ""}`}>
                  {todo.title}
                </span>

                {/* Botón editar título */}
                {editingId === todo.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="rounded border px-2 py-1"
                    />
                    <button
                      onClick={() => saveEdit(todo.id)}
                      className="rounded bg-green-600 px-3 py-1 text-white"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded bg-gray-400 px-3 py-1 text-white"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(todo.id, todo.title)}
                      className="rounded bg-yellow-600 px-3 py-1 text-white"
                    >
                      Editar
                    </button>
                    {/* Botón borrar */}
                    <button
                      onClick={() => deleteTodo.mutate({ id: todo.id })}
                      className="rounded bg-red-600 px-3 py-1 text-white"
                      disabled={deleteTodo.isPending}
                    >
                      Borrar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
