1. Utgå från exemplet i app.ts. Det gör så att man kan styra och hoppa med en karaktär. Du får självklart ändra i exemplet.
2. Gör en ny figur (rektangel) som dyker upp längst till höger på skärmen och åker åt vänster.  
   Tips: Det finns en variabel W inbyggd som vet hur bred skärmen är (x-led). Uppdatera x-värdet i update-funktionen med några pixlar så den åker åt vänster.
3. Skapa en hitbox som rör sig likadant som karaktären, och en som rör sig likadant som figuren i deluppgiften ovan. Såhär kan man skapa en hitbox:
```
let h = new Hitbox(10, 10, 50, 50)
h.drawOutline("red")
```
Det går också att använda Sprite iställer för Hitbox, de funkar likadant men Sprite har lite fler saker och kan t.ex. visa en bild.
4. Om du har två variabler h och h2 som är hitboxar, så kan du använda h.intersects(h2) med en if-sats för att kolla om två hitboxar krockar. Gör så att karaktären ”dör” (försvinner) om de krockar.
5. Slumpa höjden som rektangeln skapas på.
6. När rektangeln åker ut på vänster sida så ska den börja om på höger sida igen med ett nytt slumpmässigt värde på höjden.
7. Utveckla spelet på valfritt sätt.