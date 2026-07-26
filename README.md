# Chain Letters

Chain Letters is a real-time 2-player word dueling game where players pick letters, form word chains (words starting with one letter, ending with another), and race against a timer.

## Getting Started

### Installation steps
1. Clone this repository:  `git clone https://github.com/your-username/chain-letters.git`
2. Navigate into the project directory:  `cd chain-letters`
3. Install the dependencies:  `npm install`
4. Start the development server:  `npm run dev`
5. Open your browser and go to `http://localhost:3000`

## How it works
1. **Two players, one room**: Create a room and share the code, or join with a code.
2. **Pick your letters**: Each player secretly picks a letter. One becomes the Start letter, the other the End letter for the round.
3. **Build the chain**: Take turns submitting words. Every word must start with the Start letter and end with the End letter for that round.
4. **Beat the clock**: You have a limited time on your turn. Run out of time or submit an invalid word and your opponent wins the round.
5. **Win the match**: Win the most rounds to take the match. Best of 1, 3, or 5 rounds, host's choice.

### Example Chain
For instance, if your Start letter is **S** and your End letter is **E**, a valid sequence of words could be:
`SCORE` → `SHADE` → `SMILE` → `STONE`. Each word connects based on the letters chosen!

## Stack
- **Next.js 15** (App Router, React 19)
- **Supabase** (Postgres + Realtime for live updates)
- **Tailwind CSS v4**
- **TypeScript**
- **Zod** for server-side validation
- **Upstash Redis** (optional, for rate limiting)

## Features
- **Word Dueling**: Compete in real-time against another player.
- **Word Chains**: Create valid word chains to score points.
- **User Friendly Interface**: Easy navigation and game setup.

## Development Commands
- **Run Development Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Run ESLint**: `npm run lint`
- **Format Code**: `npm run format`

## Contributing
Contributions are welcome! Please fork the repo and submit a pull request.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details.
