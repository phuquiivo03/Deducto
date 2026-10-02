# Deducto 🕵️
An interactive mystery deduction game where players solve intricate criminal cases by connecting clues, analyzing evidence, and uncovering culprit identities—powered by Generative AI for custom case creation.

**🌈 Demo**:  https://deducto-gamma.vercel.app/

<img width="664" height="394" alt="SCR-20261002-qcod" src="https://github.com/user-attachments/assets/0a6e8164-10d5-4575-8bd9-6fcf023c5025" />



## 💡 About the Project
Deducto is a web-based detective puzzle game designed for puzzle enthusiasts and investigative minds. Players dive into immersive mystery cases where they must connect scattered pieces of evidence, cross-examine clues, and apply logical deduction to unmask the true culprit.

Beyond playing pre-designed cases, Deducto leverages Generative AI to empower users to generate their own custom detective mysteries, complete with suspect profiles, motives, red herrings, and interconnected clue networks.

## ✨ Key Features
**🔍 Interactive Clue-Linking Gameplay:** Connect clues, evidence, and suspect statements dynamically to construct logical chains and identify the murderer.

**🤖 AI-Powered Case Generator:** Create endless custom mystery cases using Generative AI. Prompt the AI with scenarios, settings, or themes to auto-generate fully playable cases with balanced clues.

**📜 Rich Case Files & Suspect Profiles:** Detailed story arcs, character backgrounds, alibis, and evidence sheets for deep immersion.

**🎮 User-Generated Case Hub:** Share your AI-crafted or custom-designed mystery cases with the community and play cases created by other sleuths.

**📈 Real-Time Progress Saving:** Track solved cases, deduction accuracy, and ongoing investigations.

## 🛠️ Tech Stack
**Frontend:** Next.js, React, TypeScript, Tailwind CSS, Zustand, React Flow (for clue-linking graph views)

**Backend & AI:** Node.js, Google Gemini API / OpenAI API, Supabase (Auth & Database)

**Deployment & Hosting:** Vercel

## 🚀 Getting Started
Follow these instructions to set up and run Deducto locally on your machine.

### Prerequisites
Make sure you have the following installed:

Node.js (v18.0 or higher)

npm, yarn, or pnpm

### Installation
Clone the repository:

```
git clone https://github.com/phuquiivo03/Deducto.git
cd Deducto
```

Install dependencies:

```
npm install
```
or
```
pnpm install
```
Set up environment variables:
Create a .env.local file in the root directory and add your credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
Run the development server:
```
```
npm run dev
```
or
```
pnpm dev
```
Open in browser:
Navigate to http://localhost:3000 to start investigating!

## 🎯 How to Play
- Select a Case: Choose a built-in scenario or a user-created case from the repository.

- Examine Evidence: Read character testimonies, crime scene logs, and physical evidence.

- Connect the Clues: Link related pieces of information to form deduction chains and expose contradictions.

- Name the Culprit: Once you have sufficient evidence, submit your accusation and view your deduction report.

- Create Your Own: Head to the Case Creator, prompt the AI assistant, and publish your own custom mystery!

📄 License
This project is open-source and available under the MIT License.
