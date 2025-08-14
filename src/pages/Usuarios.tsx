import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Usuario {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroRole, setFiltroRole] = useState('');
  const [carregando, setCarregando] = useState(false);

  const token = localStorage.getItem('token');

  const fetchUsuarios = async () => {
    try {
      setCarregando(true);
      const response = await axios.get('http://localhost:3000/user/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter((user) => {
    const nomeMatch = user.name.toLowerCase().includes(busca.toLowerCase());
    const roleMatch = filtroRole ? user.role === filtroRole : true;
    return nomeMatch && roleMatch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <Input
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full md:w-1/2"
        />

        <Select  onValueChange={(value) => setFiltroRole(value === "TODOS" ? "" : value)}>
          <SelectTrigger className="w-full md:w-1/3">
            <SelectValue placeholder="Filtrar por perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
            <SelectItem value="USER">USER</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={fetchUsuarios} disabled={carregando}>
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {usuariosFiltrados.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <h3 className="text-lg font-bold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-sm">Perfil: {user.role}</p>
              <p className="text-sm">Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {usuariosFiltrados.length === 0 && (
        <p className="text-center text-muted-foreground mt-6">Nenhum usuário encontrado.</p>
      )}
    </div>
  );
}
