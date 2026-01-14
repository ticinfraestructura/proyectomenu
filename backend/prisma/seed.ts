import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create permissions
  const modulos = [
    'emergencias',
    'inventario',
    'beneficiarios',
    'entregas',
    'configuracion',
    'seguridad',
  ];

  const acciones = ['crear', 'leer', 'actualizar', 'eliminar'];

  const permisos = [];
  for (const modulo of modulos) {
    for (const accion of acciones) {
      const permiso = await prisma.permiso.upsert({
        where: { codigo: `${modulo}:${accion}` },
        update: {},
        create: {
          codigo: `${modulo}:${accion}`,
          nombre: `${accion.charAt(0).toUpperCase() + accion.slice(1)} ${modulo}`,
          modulo,
          accion,
        },
      });
      permisos.push(permiso);
    }
  }
  console.log(`✅ Created ${permisos.length} permissions`);

  // Create roles
  const rolesData = [
    {
      codigo: 'ADMIN',
      nombre: 'Administrador',
      descripcion: 'Acceso total al sistema',
      permisos: permisos.map((p) => p.id),
    },
    {
      codigo: 'COORDINADOR',
      nombre: 'Coordinador',
      descripcion: 'Gestiona emergencias, entregas y reportes',
      permisos: permisos
        .filter((p) =>
          ['emergencias', 'entregas', 'beneficiarios', 'inventario'].includes(p.modulo)
        )
        .map((p) => p.id),
    },
    {
      codigo: 'BODEGUERO',
      nombre: 'Bodeguero',
      descripcion: 'Gestiona inventario y movimientos',
      permisos: permisos
        .filter((p) => ['inventario', 'configuracion'].includes(p.modulo))
        .map((p) => p.id),
    },
    {
      codigo: 'DIGITADOR',
      nombre: 'Digitador',
      descripcion: 'Registra beneficiarios y entregas',
      permisos: permisos
        .filter(
          (p) =>
            ['beneficiarios', 'entregas'].includes(p.modulo) ||
            (p.modulo === 'emergencias' && p.accion === 'leer')
        )
        .map((p) => p.id),
    },
    {
      codigo: 'CONSULTA',
      nombre: 'Solo Consulta',
      descripcion: 'Solo lectura en todos los módulos',
      permisos: permisos.filter((p) => p.accion === 'leer').map((p) => p.id),
    },
  ];

  for (const rolData of rolesData) {
    const rol = await prisma.rol.upsert({
      where: { codigo: rolData.codigo },
      update: {},
      create: {
        codigo: rolData.codigo,
        nombre: rolData.nombre,
        descripcion: rolData.descripcion,
      },
    });

    for (const permisoId of rolData.permisos) {
      await prisma.rolPermiso.upsert({
        where: {
          rolId_permisoId: {
            rolId: rol.id,
            permisoId: permisoId,
          },
        },
        update: {},
        create: {
          rolId: rol.id,
          permisoId: permisoId,
        },
      });
    }
  }
  console.log(`✅ Created ${rolesData.length} roles with permissions`);

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@sistema.com' },
    update: {},
    create: {
      nombres: 'Administrador',
      apellidos: 'Sistema',
      email: 'admin@sistema.com',
      celular: '3001234567',
      passwordHash: adminPassword,
      activo: true,
    },
  });

  const adminRol = await prisma.rol.findUnique({ where: { codigo: 'ADMIN' } });
  if (adminRol) {
    await prisma.usuarioRol.upsert({
      where: {
        usuarioId_rolId: {
          usuarioId: adminUser.id,
          rolId: adminRol.id,
        },
      },
      update: {},
      create: {
        usuarioId: adminUser.id,
        rolId: adminRol.id,
      },
    });
  }
  console.log('✅ Created admin user: admin@sistema.com / Admin123!');

  // Create disaster types
  const tiposDesastre = [
    { codigo: 'INUNDACION', nombre: 'Inundación', descripcion: 'Desbordamiento de ríos y cuerpos de agua' },
    { codigo: 'TERREMOTO', nombre: 'Terremoto', descripcion: 'Movimiento telúrico' },
    { codigo: 'DESLIZAMIENTO', nombre: 'Deslizamiento', descripcion: 'Deslizamiento de tierra' },
    { codigo: 'INCENDIO', nombre: 'Incendio', descripcion: 'Incendio forestal o estructural' },
    { codigo: 'SEQUIA', nombre: 'Sequía', descripcion: 'Falta prolongada de lluvia' },
    { codigo: 'HURACAN', nombre: 'Huracán', descripcion: 'Fenómeno atmosférico severo' },
  ];

  for (const tipo of tiposDesastre) {
    await prisma.tipoDesastre.upsert({
      where: { codigo: tipo.codigo },
      update: {},
      create: tipo,
    });
  }
  console.log(`✅ Created ${tiposDesastre.length} disaster types`);

  // Create product categories
  const categorias = [
    { codigo: 'ALIMENTOS', nombre: 'Alimentos', descripcion: 'Productos alimenticios no perecederos' },
    { codigo: 'HIGIENE', nombre: 'Higiene', descripcion: 'Productos de aseo personal' },
    { codigo: 'COBIJO', nombre: 'Cobijo', descripcion: 'Carpas, mantas, colchonetas' },
    { codigo: 'COCINA', nombre: 'Cocina', descripcion: 'Utensilios de cocina' },
    { codigo: 'AGUA', nombre: 'Agua', descripcion: 'Agua potable y purificación' },
    { codigo: 'MEDICAMENTOS', nombre: 'Medicamentos', descripcion: 'Medicamentos básicos' },
  ];

  for (const cat of categorias) {
    await prisma.categoriaProducto.upsert({
      where: { codigo: cat.codigo },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ Created ${categorias.length} product categories`);

  // Create measurement units
  const unidades = [
    { codigo: 'UND', nombre: 'Unidad', abreviatura: 'und' },
    { codigo: 'KG', nombre: 'Kilogramo', abreviatura: 'kg' },
    { codigo: 'LT', nombre: 'Litro', abreviatura: 'lt' },
    { codigo: 'MT', nombre: 'Metro', abreviatura: 'mt' },
    { codigo: 'CAJA', nombre: 'Caja', abreviatura: 'caja' },
    { codigo: 'PAQUETE', nombre: 'Paquete', abreviatura: 'paq' },
  ];

  for (const unidad of unidades) {
    await prisma.unidadMedida.upsert({
      where: { codigo: unidad.codigo },
      update: {},
      create: unidad,
    });
  }
  console.log(`✅ Created ${unidades.length} measurement units`);

  // Create special conditions
  const condiciones = [
    { codigo: 'DISCAPACIDAD', nombre: 'Discapacidad', descripcion: 'Persona con discapacidad física o mental' },
    { codigo: 'ADULTO_MAYOR', nombre: 'Adulto Mayor', descripcion: 'Persona mayor de 60 años' },
    { codigo: 'GESTANTE', nombre: 'Gestante', descripcion: 'Mujer en estado de embarazo' },
    { codigo: 'LACTANTE', nombre: 'Lactante', descripcion: 'Mujer en periodo de lactancia' },
    { codigo: 'MENOR_EDAD', nombre: 'Menor de Edad', descripcion: 'Persona menor de 18 años' },
    { codigo: 'ENF_CRONICA', nombre: 'Enfermedad Crónica', descripcion: 'Persona con enfermedad crónica' },
  ];

  for (const cond of condiciones) {
    await prisma.condicionEspecial.upsert({
      where: { codigo: cond.codigo },
      update: {},
      create: cond,
    });
  }
  console.log(`✅ Created ${condiciones.length} special conditions`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
