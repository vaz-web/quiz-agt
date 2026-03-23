import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-leads`;

export default function AdminExport() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const download = async (format: "csv" | "json") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${FUNCTION_URL}?key=${encodeURIComponent(key)}&format=${format}`);
      if (!res.ok) throw new Error(res.status === 401 ? "Chave inválida" : "Erro ao exportar");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-md space-y-6">
        <h1 className="font-serif text-2xl font-bold text-center">Exportar Leads</h1>
        <p className="text-muted-foreground text-sm text-center">
          Insira a chave de acesso para baixar os leads.
        </p>
        <Input
          type="password"
          placeholder="Chave de acesso"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="bg-secondary/50 border-border/50 h-12"
        />
        {error && <p className="text-destructive text-sm text-center">{error}</p>}
        <div className="flex gap-3">
          <Button
            onClick={() => download("csv")}
            disabled={!key || loading}
            className="flex-1 gradient-gold text-primary-foreground font-bold"
          >
            <Download className="h-4 w-4 mr-2" /> CSV
          </Button>
          <Button
            onClick={() => download("json")}
            disabled={!key || loading}
            variant="outline"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" /> JSON
          </Button>
        </div>
      </div>
    </div>
  );
}
