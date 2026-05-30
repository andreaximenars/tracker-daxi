# Tracker Daxi

Control de gastos compartidos para Dani y Xime. Lleva la cuenta de quien debe cuanto, con divisiones personalizables por categoria.

## Caracteristicas

- **Transacciones** — registra gastos con fecha causada vs fecha de pago
- **Division flexible** — configura que % paga cada quien por categoria (ej. 70/30 Xime/Dani)
- **Gastos 100% personales** — aunque uno pague, se puede asignar 100% al otro
- **Resumen mensual** — tabla de cruce que muestra quien le debe cuanto a quien
- **Presupuestos** — a nivel pareja, Xime o Dani por categoria
- **Historial completo** — filtra por mes, categoria, quien pago y estado

## Instalacion

Necesitas **Node.js** instalado. Si no lo tienes, descargalo desde https://nodejs.org

### Pasos

1. Clona el repositorio:
   ```bash
   git clone https://github.com/ximenarueda/tracker-daxi.git
   cd tracker-daxi
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Crea la base de datos y carga las categorias:
   ```bash
   npm run setup
   ```

4. Inicia la app:
   ```bash
   npm run dev
   ```

5. Abre **http://localhost:3000** en tu navegador.

## Uso

### Agregar una transaccion
1. Ve a "Nueva" en el menu
2. Llena descripcion, categoria, monto, quien pago y fechas
3. Ajusta el % de division (se llena automaticamente desde la categoria)
4. Guarda

### Ver quien debe cuanto
La pagina de **Resumen** muestra:
- Tarjeta grande: balance actual del mes (quien debe cuanto)
- Tabla de cruce: detalle de pagos y asignaciones por persona

### Configurar categorias
En **Categorias** puedes crear, editar y eliminar categorias con su division por defecto.

### Presupuestos
En **Presupuestos** configura cuanto se puede gastar por mes, a nivel pareja, solo Xime o solo Dani.

## Formula del balance

- **Cruce Xime** = (Xime pago para Dani) - (Dani pago para Xime)
  - Positivo = Dani le debe a Xime
  - Negativo = Xime le debe a Dani

Ejemplo: si Xime pago el arriendo ($3,000 con 70/30), asigno $900 a Dani.
Si Dani no pago nada ese mes, Dani le debe $900 a Xime.

## Comandos utiles

```bash
npm run dev          # Iniciar en modo desarrollo
npm run build        # Compilar para produccion
npm run setup        # Crear/resetear BD y cargar categorias
npm run db:studio    # Abrir el explorador de BD (Prisma Studio)
```
