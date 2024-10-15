type Spaceship = {
    id: number;
    name: string;
    pilot: string;
    crewLimit: number;
    crew: string[];
    inMission: boolean;
};

const spaceships: Spaceship[] = [];

async function startUserInteraction(): Promise<void> {
    let option: number;
    do {
        option = parseInt(prompt('Escolha uma opção:\n1. Registrar Nave\n2. Adicionar Tripulante\n3. Enviar Nave para Missão\n4. Listar Naves\n5. Sair') || '0');
        await handleUserOption(option);
    } while (option !== 5);
}

document.addEventListener('DOMContentLoaded', () => {
    startUserInteraction();
});

async function saveSpaceshipOnServer(spaceship: Spaceship): Promise<void> {
    const response = await fetch('http://localhost:3000/spaceships', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(spaceship)
    });
    if (response.ok) {
        console.log('Nave salva no servidor com sucesso.');
    } else {
        console.error('Erro ao salvar nave no servidor.', await response.text());
    }
}

async function updateSpaceshipOnServer(spaceship: Spaceship): Promise<void> {
    const response = await fetch(`http://localhost:3000/spaceships/${spaceship.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(spaceship)
    });
    if (response.ok) {
        console.log('Nave atualizada no servidor com sucesso.');
    } else {
        console.error('Erro ao atualizar nave no servidor.', await response.text());
    }
}

async function getSpaceshipsFromServer(): Promise<Spaceship[]> {
    const response = await fetch('http://localhost:3000/spaceships');
    if (response.ok) {
        return await response.json();
    } else {
        console.error('Erro ao buscar naves do servidor.', await response.text());
        return [];
    }
}

function addSpaceship(name: string, pilot: string, crewLimit: number): void {
    const spaceship: Spaceship = {
        id: spaceships.length > 0 ? Math.max(...spaceships.map(s => s.id)) + 1 : 1,
        name,
        pilot,
        crewLimit,
        crew: [],
        inMission: false
    };
    spaceships.push(spaceship);
    alert(`A espaçonave ${spaceship.name} foi registrada.`);
    saveSpaceshipOnServer(spaceship);
}

async function findSpaceship(name: string): Promise<Spaceship | undefined> {
    const response = await fetch(`http://localhost:3000/spaceships?name=${encodeURIComponent(name)}`);
    if (response.ok) {
        const spaceships: Spaceship[] = await response.json();
        return spaceships.length > 0 ? spaceships[0] : undefined;
    } else {
        console.error('Erro ao buscar a nave no servidor.', await response.text());
        return undefined;
    }
}

async function addCrewMember(member: string, spaceship: Spaceship): Promise<void> {
    if (spaceship.crew.length >= spaceship.crewLimit) {
        alert("O membro não pode ser adicionado. Limite máximo atingido.");
    } else {
        // Adiciona o membro à tripulação
        spaceship.crew.push(member);
        alert(`Membro ${member} adicionado à tripulação da nave ${spaceship.name}.`);
        
        // Atualiza a nave no servidor
        await updateSpaceshipOnServer(spaceship);
    }
}

function sendInMission(spaceship: Spaceship): void {
    if (spaceship.inMission) {
        alert(`A espaçonave ${spaceship.name} já está em missão.`);
    } else if (spaceship.crew.length < Math.ceil(spaceship.crewLimit / 3)) {
        alert(`A espaçonave ${spaceship.name} não possui membros suficientes para ser enviada para a missão.`);
    } else {
        spaceship.inMission = true;
        alert(`A espaçonave ${spaceship.name} foi enviada para a missão.`);
        updateSpaceshipOnServer(spaceship);
    }
}

function firstMenuOption(): void {
    const name = prompt('Qual o nome da nave a ser registrada?');
    const pilot = prompt(`Qual o nome do piloto da ${name}?`);
    const crewLimit = parseInt(prompt('Qual o limite de tripulação?') || '0');
    if (name && pilot && !isNaN(crewLimit) && crewLimit > 0) {
        const confirmation = confirm(`Confirma o registro da nave ${name} \nPiloto: ${pilot} \nCom o limite da tripulação: ${crewLimit}?`);
        if (confirmation) {
            addSpaceship(name, pilot, crewLimit);
        }
    } else {
        alert('Dados inválidos. Tente novamente.');
    }
}

async function secondMenuOption(): Promise<void> {
    const member = prompt("Qual é o nome do tripulante?");
    const spaceshipName = prompt(`Para qual nave o ${member} será designado?`);
    
    if (spaceshipName && member) {
        const spaceship = await findSpaceship(spaceshipName);
        if (spaceship) {
            await addCrewMember(member, spaceship);
        } else {
            alert('Nave não encontrada.');
        }
    } else {
        alert('Nome do tripulante ou da nave não pode estar vazio.');
    }
}

async function thirdMenuOption(): Promise<void> {
    const spaceshipName = prompt('Qual nave será enviada para missão?');
    const spaceship = await findSpaceship(spaceshipName || '');
    if (spaceship) {
        const confirmation = confirm(`Deseja enviar a nave ${spaceshipName} para esta missão?`);
        if (confirmation) {
            sendInMission(spaceship);
        }
    } else {
        alert('Nave não encontrada.');
    }
}

async function fourthMenuOption(): Promise<void> {
    const spaceships = await getSpaceshipsFromServer();
    let list = 'Naves Registradas:\n';
    spaceships.forEach((spaceship) => {
        list += `Nave: ${spaceship.name}
Piloto: ${spaceship.pilot}
Em missão? ${spaceship.inMission ? 'Sim' : 'Não'}
Tamanho máximo da tripulação: ${spaceship.crewLimit}
Tripulantes: ${spaceship.crew.length}\n`;
        spaceship.crew.forEach(member => {
            list += `   - ${member}\n`;
        });
    });
    alert(list);
}

async function handleUserOption(option: number): Promise<void> {
    switch (option) {
        case 1:
            firstMenuOption();
            break;
        case 2:
            await secondMenuOption();
            break;
        case 3:
            await thirdMenuOption();
            break;
        case 4:
            await fourthMenuOption();
            break;
        case 5:
            alert('Programa encerrado.');
            break;
        default:
            alert('Opção inválida.');
            break;
    }
}
