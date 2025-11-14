import { useState } from "react";
import { api } from "@/lib/api";

type Role = "ADMIN" | "USER";

const roles: Role[] = ["ADMIN", "USER"];

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

type RegisterResponse = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export default function RegisterForm() {
  const [form, setForm] = useState<RegisterPayload>({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      // garante Role válido
      [name]: name === "role" ? (value.toUpperCase() as Role) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const { data } = await api.post<RegisterResponse>("/auth/register", form);

      setMessage(`✅ Usuário ${data.name} cadastrado com sucesso!`);
      // opcional: limpar o form
      setForm({ name: "", email: "", password: "", role: "USER" });
    } catch (err: any) {
      const apiMsg =
        err?.response?.data?.error ||
        err?.response?.data?.mensagem ||
        err?.message ||
        "Erro ao registrar";
      setMessage(`❌ ${apiMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-xl rounded-xl">
      <h2 className="text-xl font-bold mb-4">Cadastro de Usuário</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          type="text"
          placeholder="Nome"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
