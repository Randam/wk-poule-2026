/**
 * Info View – WK 2026 Poule
 * Renders the information page detailing copyright, origin, and scoring multipliers.
 */
export function renderInfo() {
  const content = document.getElementById('app-content');
  const header = document.getElementById('app-header');

  header.innerHTML = `
    <div class="header-title">ℹ️ Informatie</div>
    <div class="header-subtitle">Over de poule en puntentelling</div>
  `;

  content.innerHTML = `
    <div class="fade-in" style="padding: 0 16px 32px; display: flex; flex-direction: column; gap: 20px;">
      
      <!-- Over de Poule -->
      <div class="glass-card">
        <h2 style="margin-bottom: 12px; font-family: 'Outfit', sans-serif; font-size: 18px; color: var(--primary); display: flex; align-items: center; gap: 8px;">
          <span>⚽</span> Over de Poule
        </h2>
        <p style="margin-bottom: 12px; line-height: 1.6; color: var(--text-secondary);">
          De basis van deze WK 2026 voorspellingspoule is gemaakt als <strong>one-shot</strong> met de AI-codeassistent <strong>Antigravity</strong>.
        </p>
        <p style="line-height: 1.6; color: var(--text-secondary);">
          Het is speciaal ontwikkeld voor de <strong>familie Derwort</strong> om samen op een leuke en overzichtelijke manier de wedstrijden te voorspellen en de onderlinge strijd aan te gaan!
        </p>
      </div>

      <!-- Puntentelling -->
      <div class="glass-card">
        <h2 style="margin-bottom: 12px; font-family: 'Outfit', sans-serif; font-size: 18px; color: var(--primary); display: flex; align-items: center; gap: 8px;">
          <span>📊</span> De Puntentelling
        </h2>
        <p style="margin-bottom: 16px; line-height: 1.6; color: var(--text-secondary);">
          Per wedstrijd kun je in de basis maximaal <strong>5 punten</strong> verdienen op basis van de volgende criteria:
        </p>
        
        <ul style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
          <li style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 6px; color: var(--text-secondary);">
            <span>🟢 Goede winnaar (of gelijkspel)</span>
            <strong style="color: var(--primary);">2 pt</strong>
          </li>
          <li style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 6px; color: var(--text-secondary);">
            <span>⚽ Aantal doelpunten thuisploeg goed</span>
            <strong style="color: var(--primary);">+1 pt</strong>
          </li>
          <li style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 6px; color: var(--text-secondary);">
            <span>⚽ Aantal doelpunten uitploeg goed</span>
            <strong style="color: var(--primary);">+1 pt</strong>
          </li>
          <li style="display: flex; justify-content: space-between; padding-bottom: 6px; color: var(--text-secondary);">
            <span>📐 Doelsaldo (doelpuntenverschil) goed</span>
            <strong style="color: var(--primary);">+1 pt</strong>
          </li>
        </ul>
        
        <div style="background: rgba(255,255,255,0.03); border: 1px dashed var(--border); border-radius: var(--radius-md); padding: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
          <strong>Let op:</strong> Het punt voor het doelsaldo staat los van de exacte uitslag. Als je bijvoorbeeld 2-0 voorspelt en de uitslag is 3-1, krijg je 2 punten voor de winnaar + 1 punt voor het doelsaldo (verschil is in beide gevallen +2).
        </div>
      </div>

      <!-- Vermenigvuldigers -->
      <div class="glass-card">
        <h2 style="margin-bottom: 12px; font-family: 'Outfit', sans-serif; font-size: 18px; color: var(--primary); display: flex; align-items: center; gap: 8px;">
          <span>🔥</span> Knockout Vermenigvuldigers
        </h2>
        <p style="margin-bottom: 16px; line-height: 1.6; color: var(--text-secondary);">
          Na de groepsfase stijgt de spanning! De behaalde punten per wedstrijd worden in elke volgende ronde vermenigvuldigd:
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 10px; text-align: center;">
            <div style="font-size: 12px; color: var(--text-muted);">Groepsfase</div>
            <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">1x punten</div>
            <div style="font-size: 11px; color: var(--primary);">Max. 5 pt</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 10px; text-align: center;">
            <div style="font-size: 12px; color: var(--text-muted);">Ronde van 32</div>
            <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">2x punten</div>
            <div style="font-size: 11px; color: var(--primary);">Max. 10 pt</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 10px; text-align: center;">
            <div style="font-size: 12px; color: var(--text-muted);">Achtste Finale</div>
            <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">3x punten</div>
            <div style="font-size: 11px; color: var(--primary);">Max. 15 pt</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 10px; text-align: center;">
            <div style="font-size: 12px; color: var(--text-muted);">Kwartfinale</div>
            <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">4x punten</div>
            <div style="font-size: 11px; color: var(--primary);">Max. 20 pt</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 10px; text-align: center;">
            <div style="font-size: 12px; color: var(--text-muted);">Halve Finale</div>
            <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">5x punten</div>
            <div style="font-size: 11px; color: var(--primary);">Max. 25 pt</div>
          </div>
          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 10px; text-align: center;">
            <div style="font-size: 12px; color: var(--text-muted);">Troost- & Finale</div>
            <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">6x punten</div>
            <div style="font-size: 11px; color: var(--primary);">Max. 30 pt</div>
          </div>
        </div>

        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; text-align: center;">
          Een perfect voorspelde finale levert dus maar liefst <strong style="color: var(--primary);">30 punten</strong> op!
        </p>
      </div>

      <!-- Copyright -->
      <div style="text-align: center; margin-top: 10px; font-size: 12px; color: var(--text-muted); line-height: 1.6;">
        <div>&copy; 2026 Derwort Media</div>
        <div>Ontwikkeld door <strong>Jeroen Derwort</strong></div>
      </div>

    </div>
  `;
}
