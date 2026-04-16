// CartContext.tsx - El motor de tu bolsa
export const agregarAlCarrito = (
  producto: any,
  carritoActual: any[],
  setCarrito: (nuevoCarrito: any[]) => void,
) => {
  // Verificamos si ya existe para sumar cantidad o agregar nuevo
  const existe = carritoActual.find((item) => item.id === producto.id);

  if (existe) {
    setCarrito(
      carritoActual.map((item) =>
        item.id === producto.id
          ? {
              ...item,
              cantidad: item.cantidad + (producto.cantidadSeleccionada || 1),
            }
          : item,
      ),
    );
  } else {
    setCarrito([
      ...carritoActual,
      { ...producto, cantidad: producto.cantidadSeleccionada || 1 },
    ]);
  }
};
