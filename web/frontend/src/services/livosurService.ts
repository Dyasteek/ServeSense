import { parse } from 'node-html-parser';

export interface LivosurTeam {
  name: string;
  points: number;
  position: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
}

export interface LivosurMatch {
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  status: 'played' | 'pending';
  venue: string;
  referees: string[];
}

export interface LivosurDivision {
  id: string;
  name: string;
  category: string;
  gender: string;
  level: string;
}

export const livosurService = {
  async getDivisions(): Promise<LivosurDivision[]> {
    try {
      const response = await fetch('https://livosur-web.dataproject.com/CompetitionHome.aspx?ID=178', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener datos de LiVoSur');
      }

      const html = await response.text();
      const root = parse(html);

      // Encontrar el menú de divisiones
      const divisionMenu = root.querySelector('#MainContent_DropDownListDivisions');
      if (!divisionMenu) {
        throw new Error('No se encontró el menú de divisiones');
      }

      const divisions: LivosurDivision[] = [];
      const options = divisionMenu.querySelectorAll('option');

      options.forEach(option => {
        const value = option.getAttribute('value');
        const name = option.textContent.trim();
        if (value && name) {
          // Extraer información de la división del nombre
          const parts = name.split(' - ');
          const category = parts[0] || '';
          const gender = parts[1] || '';
          
          // Determinar el nivel de la división
          let level = '';
          if (category.includes('Primera')) level = 'Primera';
          else if (category.includes('Segunda')) level = 'Segunda';
          else if (category.includes('Tercera')) level = 'Tercera';
          else if (category.includes('A')) level = 'A';
          else if (category.includes('B')) level = 'B';
          else if (category.includes('C')) level = 'C';
          else if (category.includes('D')) level = 'D';
          
          divisions.push({ 
            id: value, 
            name: name,
            category,
            gender,
            level
          });
        }
      });

      return divisions;
    } catch (error) {
      console.error('Error al obtener divisiones de LiVoSur:', error);
      // Retornar datos de ejemplo más completos en caso de error
      return [
        // Masculino
        { 
          id: '184', 
          name: 'Primera División - Masculino',
          category: 'Primera División',
          gender: 'Masculino',
          level: 'Primera'
        },
        { 
          id: '185', 
          name: 'Segunda División - Masculino',
          category: 'Segunda División',
          gender: 'Masculino',
          level: 'Segunda'
        },
        { 
          id: '186', 
          name: 'Tercera División - Masculino',
          category: 'Tercera División',
          gender: 'Masculino',
          level: 'Tercera'
        },
        { 
          id: '187', 
          name: 'División A - Masculino',
          category: 'División A',
          gender: 'Masculino',
          level: 'A'
        },
        { 
          id: '188', 
          name: 'División B - Masculino',
          category: 'División B',
          gender: 'Masculino',
          level: 'B'
        },
        { 
          id: '189', 
          name: 'División C - Masculino',
          category: 'División C',
          gender: 'Masculino',
          level: 'C'
        },
        { 
          id: '190', 
          name: 'División D - Masculino',
          category: 'División D',
          gender: 'Masculino',
          level: 'D'
        },
        // Femenino
        { 
          id: '191', 
          name: 'Primera División - Femenino',
          category: 'Primera División',
          gender: 'Femenino',
          level: 'Primera'
        },
        { 
          id: '192', 
          name: 'Segunda División - Femenino',
          category: 'Segunda División',
          gender: 'Femenino',
          level: 'Segunda'
        },
        { 
          id: '193', 
          name: 'Tercera División - Femenino',
          category: 'Tercera División',
          gender: 'Femenino',
          level: 'Tercera'
        },
        { 
          id: '194', 
          name: 'División A - Femenino',
          category: 'División A',
          gender: 'Femenino',
          level: 'A'
        },
        { 
          id: '195', 
          name: 'División B - Femenino',
          category: 'División B',
          gender: 'Femenino',
          level: 'B'
        },
        { 
          id: '196', 
          name: 'División C - Femenino',
          category: 'División C',
          gender: 'Femenino',
          level: 'C'
        },
        { 
          id: '197', 
          name: 'División D - Femenino',
          category: 'División D',
          gender: 'Femenino',
          level: 'D'
        }
      ];
    }
  },

  async getTeams(): Promise<LivosurTeam[]> {
    try {
      const response = await fetch('https://livosur-web.dataproject.com/CompetitionHome.aspx?ID=178', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener datos de LiVoSur');
      }

      const html = await response.text();
      const root = parse(html);

      // Encontrar la tabla de clasificación
      const table = root.querySelector('#MainContent_GridViewStandings');
      if (!table) {
        throw new Error('No se encontró la tabla de clasificación');
      }

      // Procesar cada fila de la tabla
      const teams: LivosurTeam[] = [];
      const rows = table.querySelectorAll('tr');

      // Saltamos la primera fila (encabezados)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('td');

        if (cells.length >= 8) {
          const team: LivosurTeam = {
            position: i,
            name: cells[1].textContent.trim(),
            matchesPlayed: parseInt(cells[2].textContent.trim(), 10),
            matchesWon: parseInt(cells[3].textContent.trim(), 10),
            matchesLost: parseInt(cells[4].textContent.trim(), 10),
            setsWon: parseInt(cells[5].textContent.trim(), 10),
            setsLost: parseInt(cells[6].textContent.trim(), 10),
            points: parseInt(cells[7].textContent.trim(), 10)
          };
          teams.push(team);
        }
      }

      return teams;
    } catch (error) {
      console.error('Error al obtener datos de LiVoSur:', error);
      // Retornar datos de ejemplo en caso de error
      return [
        {
          position: 1,
          name: "SAYAGO",
          points: 24,
          matchesPlayed: 8,
          matchesWon: 8,
          matchesLost: 0,
          setsWon: 24,
          setsLost: 4
        },
        {
          position: 2,
          name: "CORDON AZUL",
          points: 21,
          matchesPlayed: 8,
          matchesWon: 7,
          matchesLost: 1,
          setsWon: 22,
          setsLost: 7
        },
        {
          position: 3,
          name: "OLIMPIA B",
          points: 18,
          matchesPlayed: 8,
          matchesWon: 6,
          matchesLost: 2,
          setsWon: 20,
          setsLost: 10
        },
        {
          position: 4,
          name: "PEÑAROL U23",
          points: 15,
          matchesPlayed: 8,
          matchesWon: 5,
          matchesLost: 3,
          setsWon: 17,
          setsLost: 13
        },
        {
          position: 5,
          name: "CBR S",
          points: 12,
          matchesPlayed: 8,
          matchesWon: 4,
          matchesLost: 4,
          setsWon: 14,
          setsLost: 16
        },
        {
          position: 6,
          name: "UDELAR B",
          points: 9,
          matchesPlayed: 8,
          matchesWon: 3,
          matchesLost: 5,
          setsWon: 11,
          setsLost: 19
        },
        {
          position: 7,
          name: "LEGADO",
          points: 6,
          matchesPlayed: 8,
          matchesWon: 2,
          matchesLost: 6,
          setsWon: 8,
          setsLost: 22
        },
        {
          position: 8,
          name: "COUNTRY EL PINAR J",
          points: 3,
          matchesPlayed: 8,
          matchesWon: 1,
          matchesLost: 7,
          setsWon: 5,
          setsLost: 25
        }
      ];
    }
  },

  async getMatches(): Promise<LivosurMatch[]> {
    try {
      const response = await fetch('https://livosur-web.dataproject.com/CompetitionMatches.aspx?ID=178&PID=184', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener datos de LiVoSur');
      }

      const html = await response.text();
      const root = parse(html);

      const matches: LivosurMatch[] = [];
      const matchRows = root.querySelectorAll('.match-row');

      matchRows.forEach(row => {
        const date = row.querySelector('.match-date')?.textContent.trim() || '';
        const time = row.querySelector('.match-time')?.textContent.trim() || '';
        const homeTeam = row.querySelector('.home-team')?.textContent.trim() || '';
        const awayTeam = row.querySelector('.away-team')?.textContent.trim() || '';
        const score = row.querySelector('.match-score')?.textContent.trim() || '';
        const venue = row.querySelector('.match-venue')?.textContent.trim() || '';
        const referees = row.querySelector('.match-referees')?.textContent.trim().split(',').map(r => r.trim()) || [];

        const status = score ? 'played' : 'pending';

        matches.push({
          date,
          time,
          homeTeam,
          awayTeam,
          score,
          status,
          venue,
          referees
        });
      });

      return matches;
    } catch (error) {
      console.error('Error al obtener partidos de LiVoSur:', error);
      // Retornar datos de ejemplo en caso de error
      return [
        {
          date: '15/03/2025',
          time: '14:00',
          homeTeam: 'LEGADO',
          awayTeam: 'SAYAGO',
          score: '1-3',
          status: 'played',
          venue: 'CDV 33',
          referees: ['Migorena Fernando', 'RODRIGUEZ BRIAN']
        },
        {
          date: '22/03/2025',
          time: '17:00',
          homeTeam: 'CBR S',
          awayTeam: 'CORDON AZUL',
          score: '2-3',
          status: 'played',
          venue: 'Gim "A" CBR',
          referees: ['Acosta Mart Martin', 'Carbajal Dario']
        },
        {
          date: '05/04/2025',
          time: '19:00',
          homeTeam: 'CBR S',
          awayTeam: 'UDELAR B',
          score: '3-0',
          status: 'played',
          venue: 'Gim "A" CBR',
          referees: ['Botta Ratto Fernando', 'Azures Monica']
        },
        {
          date: '12/04/2025',
          time: '15:00',
          homeTeam: 'SAYAGO',
          awayTeam: 'CORDON AZUL',
          score: '',
          status: 'pending',
          venue: 'Club Sayago',
          referees: []
        }
      ];
    }
  }
}; 