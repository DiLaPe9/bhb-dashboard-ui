'use client';
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function ProductDashboard() {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [markup, setMarkup] = useState(10);
  const [lang, setLang] = useState("bg");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data));

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/alerts/history`)
      .then((res) => res.json())
      .then((data) => setLogs(data));
  }, []);

  const filtered = products.filter((p) => {
    const query = search.toLowerCase();
    const matchesSearch =
      p.name?.toLowerCase().includes(query) ||
      p.sku?.toLowerCase().includes(query) ||
      p.ean?.toLowerCase().includes(query);

    const matchesAvailability =
      availability === "all" ||
      (availability === "in" && p.stock > 0) ||
      (availability === "out" && p.stock === 0);

    const price = parseFloat(p.price);
    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "low" && price < 100) ||
      (priceRange === "mid" && price >= 100 && price < 500) ||
      (priceRange === "high" && price >= 500);

    return matchesSearch && matchesAvailability && matchesPrice;
  });

  const handleGenerateOffer = async () => {
    const body = {
      products: filtered,
      markup: parseFloat(markup),
      lang
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/generate-offer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `offer_bhb.${lang}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📦 BHB API Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Търси по име, SKU или EAN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={availability} onValueChange={setAvailability}>
          <SelectTrigger>
            <SelectValue placeholder="Наличност" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всички</SelectItem>
            <SelectItem value="in">В наличност</SelectItem>
            <SelectItem value="out">Без наличност</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger>
            <SelectValue placeholder="Цена" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всички</SelectItem>
            <SelectItem value="low">&lt; 100 лв</SelectItem>
            <SelectItem value="mid">100 - 500 лв</SelectItem>
            <SelectItem value="high">&gt; 500 лв</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <Input
          type="number"
          min="0"
          value={markup}
          onChange={(e) => setMarkup(e.target.value)}
          className="w-32"
          placeholder="Марж %"
        />
        <Select value={lang} onValueChange={setLang}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bg">🇧🇬 Български</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleGenerateOffer}>📤 Генерирай оферта</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {filtered.map((p, idx) => (
          <Card
            key={idx}
            className={
              p.stock === 0
                ? "border-red-500"
                : p.oldPrice && p.price < p.oldPrice * 0.95
                ? "border-yellow-400"
                : ""
            }
          >
            <CardContent className="p-4 space-y-2">
              <h2 className="font-semibold text-lg">{p.name}</h2>
              <div className="text-sm text-muted-foreground">
                <p>SKU: {p.sku}</p>
                {p.ean && <p>EAN: {p.ean}</p>}
                <p>Цена: {p.price} лв</p>
                <p>
                  Наличност: {p.stock === 0 ? "❌ Няма" : `${p.stock} бр.`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded border shadow p-4">
        <h2 className="text-lg font-semibold mb-3">📈 История на алармите</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">SKU</th>
                <th className="p-2 text-left">Тип</th>
                <th className="p-2 text-left">Стара стойност</th>
                <th className="p-2 text-left">Нова стойност</th>
                <th className="p-2 text-left">Дата</th>
                <th className="p-2 text-left">Съобщение</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{log.sku}</td>
                  <td className="p-2">{log.type}</td>
                  <td className="p-2">{log.oldValue}</td>
                  <td className="p-2">{log.newValue}</td>
                  <td className="p-2">{new Date(log.triggeredAt).toLocaleString()}</td>
                  <td className="p-2">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}