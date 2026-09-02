"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Inicializando datos base de Correos de Bolivia (AGBC)...');
    // 1. Limpiar datos existentes
    await prisma.usageMetric.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.service.deleteMany();
    await prisma.kiosk.deleteMany();
    await prisma.user.deleteMany();
    // 2. Crear Kioscos de prueba
    await prisma.kiosk.createMany({
        data: [
            {
                code: 'KIOSK-LPZ-01',
                name: 'Kiosco Central La Paz 01',
                location: 'Agencia Central - Av. Mariscal Santa Cruz',
                ipAddress: '192.168.1.101',
                isOnline: true,
            },
            {
                code: 'KIOSK-EAL-01',
                name: 'Kiosco El Alto Ceja',
                location: 'Agencia Ceja El Alto - Calle 2',
                ipAddress: '192.168.1.102',
                isOnline: true,
            },
            {
                code: 'KIOSK-SCZ-01',
                name: 'Kiosco Santa Cruz Centro',
                location: 'Agencia Central Santa Cruz - Calle Junín',
                ipAddress: '192.168.1.103',
                isOnline: false,
            }
        ],
    });
    // 3. Crear los 5 Servicios Postales Oficiales
    await prisma.service.createMany({
        data: [
            {
                code: 'TRACKINGBO',
                name: 'Rastreo de Correspondencia',
                title: 'RASTREO DE CORRESPONDENCIA',
                description: 'Seguimiento en tiempo real de cartas y encomiendas nacionales e internacionales.',
                url: 'https://trackingbo.correos.gob.bo:8100/',
                icon: 'local_shipping',
                colorTheme: 'tracking',
                imageUrl: '/RASTREO.png',
                orderIndex: 1,
                isActive: true,
            },
            {
                code: 'POSTAR',
                name: 'Calculadora Postal',
                title: 'CALCULADORA POSTAL',
                description: 'Cotice y calcule las tarifas de envío según peso, dimensiones y destino del paquete.',
                url: 'https://postar.correos.gob.bo:8104/',
                icon: 'calculate',
                colorTheme: 'calculator',
                imageUrl: '/CALCULO.png',
                orderIndex: 2,
                isActive: true,
            },
            {
                code: 'PREENVIO',
                name: 'Generar Preenvío',
                title: 'GENERAR PREENVÍO',
                description: 'Llene y registre su formulario de envío antes de pasar a la ventanilla de atención.',
                url: 'https://trackingbo.correos.gob.bo:8100/hacer-envio-desde-casa',
                icon: 'markunread_mailbox',
                colorTheme: 'preshipment',
                imageUrl: '/Preenvio.jpg',
                orderIndex: 3,
                isActive: true,
            },
            {
                code: 'SIRECO',
                name: 'Sistema de Reclamos',
                title: 'SISTEMA DE RECLAMOS',
                description: 'Registre consultas, quejas o verifique el estado de atención de sus solicitudes.',
                url: 'https://sireco.correos.gob.bo:8102/',
                icon: 'support_agent',
                colorTheme: 'claims',
                imageUrl: '/RECLAMO2.png',
                orderIndex: 4,
                isActive: true,
            },
            {
                code: 'ADUANA',
                name: 'Kiosco Aduana',
                title: 'KIOSCO ADUANA',
                description: 'Complete el formulario y declaración jurada para despachos y envíos internacionales.',
                url: 'https://ips.correos.gob.bo/CDS.Web/Operational/andeclaration.aspx',
                icon: 'gavel',
                colorTheme: 'customs',
                imageUrl: '/DECLARACION2.png',
                orderIndex: 5,
                isActive: true,
            },
        ],
    });
    // 4. Crear usuario administrador
    await prisma.user.create({
        data: {
            username: 'admin',
            passwordHash: 'admin123', // Demo
            fullName: 'Supervisor General AGBC',
            role: 'ADMIN',
        },
    });
    // 5. Crear tickets de muestra para estadísticas
    const now = new Date();
    await prisma.ticket.createMany({
        data: [
            {
                ticketNumber: 'A-001',
                category: 'VENTANILLA',
                serviceCode: 'TRACKINGBO',
                status: 'ATTENDED',
                windowNumber: 1,
                createdAt: new Date(now.getTime() - 3600000 * 3),
                calledAt: new Date(now.getTime() - 3600000 * 2.8),
                completedAt: new Date(now.getTime() - 3600000 * 2.6),
            },
            {
                ticketNumber: 'A-002',
                category: 'ENCOMIENDAS',
                serviceCode: 'POSTAR',
                status: 'ATTENDED',
                windowNumber: 2,
                createdAt: new Date(now.getTime() - 3600000 * 2),
                calledAt: new Date(now.getTime() - 3600000 * 1.8),
                completedAt: new Date(now.getTime() - 3600000 * 1.6),
            },
            {
                ticketNumber: 'A-003',
                category: 'VENTANILLA',
                serviceCode: 'PREENVIO',
                status: 'CALLED',
                windowNumber: 1,
                createdAt: new Date(now.getTime() - 1800000),
                calledAt: new Date(now.getTime() - 300000),
            },
            {
                ticketNumber: 'A-004',
                category: 'CAJAS',
                serviceCode: null,
                status: 'WAITING',
                createdAt: new Date(now.getTime() - 600000),
            },
            {
                ticketNumber: 'A-005',
                category: 'RECLAMOS',
                serviceCode: 'SIRECO',
                status: 'WAITING',
                createdAt: new Date(now.getTime() - 120000),
            }
        ],
    });
    console.log('✅ Base de datos inicializada con éxito.');
}
main()
    .catch((e) => {
    console.error('Error al poblar base de datos:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
