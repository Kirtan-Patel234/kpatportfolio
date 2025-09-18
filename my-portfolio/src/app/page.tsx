"use client";

import { useState, useRef, useEffect } from "react";
import Duck from "../comps/Duck";
import ScrollSpy from "./scrollspy/ScrollSpy";
import ChatInputBlock from "../comps/ChatInputBlock";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("chatMessages");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);



  const sendPrompt = async (message: string) => {
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({prompt:message }),
      });

      const data = await res.json();

      // add assistant reply
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Unable to get a response." },
      ]);
    } finally {
      setLoading(false);
    }
  };
  
// Save messages on change
useEffect(() => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("chatMessages", JSON.stringify(messages));
  }
}, [messages]);



  const messagesContainerRef = useRef<HTMLDivElement | null>(null);


  // scroll to bottom if near bottom
useEffect(() => {
  const container = messagesContainerRef.current;
  if (!container) return;

  const isNearBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight < 300;

  if (isNearBottom) {
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }
}, [messages]);


// make sure saved messages only render on the client
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);


// WEBSITE UI




  return (
    <main className="relative min-h-screen flex flex-col items-center justify-start p-8 sm:p-16">
      {/* add ScrollSpy floating nav */}
      <ScrollSpy
        sectionIds={['header', 'about', 'projects']}
        thresholds={[0, 200, 1400]} // replace with scrollY positions of each section
      />

      {/* background */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/back.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/20 z-0"></div>

      {/* header */}
      <section id="header" className="relative z-10 mt-8 w-full max-w-3xl p-6 bg-white/10 backdrop-blur-md rounded-3xl text-center mb-4">
        <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-700 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] mb-2">
          Kirtan Patel
        </h1>
        <p className="font-semibold bg-gradient-to-r from-sky-300 to-cyan-400 bg-clip-text text-transparent text-base sm:text-lg">
          Data Scientist | Machine Learning | Analytics
        </p>
      </section>

      <div className="relative z-10 w-full max-w-3xl text-center mb-4">
        <p className="text-white/90 text-lg font-medium">
          👋 Meet <span className="font-semibold text-cyan-400">Sci-Kirtan</span> — 
          an AI assistant trained on my experiences, projects, and interests.  
          Ask me anything about my journey, skills, or even my favorite hobbies!
        </p>
      </div>

      {/* resume download bar */}
      <div className="absolute top-4 left-4 z-20">
        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/40">
          <span className="text-white font-medium">Resume:</span>
          <a href="/resume.pdf" download className="text-cyan-400 hover:text-blue-600 font-semibold transition">.pdf</a>
          <span className="text-white">|</span>
          <a href="/resume.txt" download className="text-cyan-400 hover:text-blue-600 font-semibold transition">.txt</a>
          <span className="text-white">|</span>
          <a href="/resume.docx" download className="text-cyan-400 hover:text-blue-600 font-semibold transition">.docx</a>
        </div>
      </div>

      {/* chat panel */}
      <div className="relative z-10 w-full max-w-3xl flex-1 bg-white/10 backdrop-blur-md rounded-3xl flex flex-col min-h-[60vh] max-h-[70vh] ">
        <div ref ={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 mb-20">
          {mounted && messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl max-w-[75%] break-words shadow-md ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white self-end"
                  : "bg-white/10 text-white border border-white/20 self-start"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="p-3 bg-white/10 rounded-xl self-start animate-pulse text-white">
              Typing...
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        <ChatInputBlock onSend={sendPrompt} loading={loading} />
      </div>

      <Duck />


{/* about Section */}
<section id="about" className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-16 space-y-8">
  {/* about Me Header - outside the box */}
  <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-700 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] pb-6">
    About Me
  </h1>

  {/* box containing the rest of the content */}
  <div className="relative z-10 max-w-4xl bg-white/10 backdrop-blur-md p-8 rounded-4xl text-gray-100 space-y-6">
    {/* content panel */}
    <div className="text-lg leading-relaxed">
      I am a passionate <span className="font-semibold">Data Scientist </span> 
      with experience in <span className="font-semibold">Machine Learning, Data Analysis, and Predictive Modeling</span>. 
      I have a strong foundation in Python, SQL, and statistical modeling, and I enjoy transforming complex datasets into actionable insights. 
      My projects range from sports analytics to financial forecasting and NLP-based applications, showcasing my ability to leverage AI for real-world problem solving.
    </div>

    <div className="text-lg leading-relaxed">
      <span className="font-semibold">📊 Professional Highlights:</span>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>Built predictive models using RandomForest, XGBoost, and PyTorch to analyze and forecast outcomes in dynamic datasets.</li>
        <li>Developed ETL pipelines for large-scale data processing and cleaning to ensure high-quality analytics.</li>
        <li>Contributed to open-source projects and Kaggle competitions to continually refine my data science and machine learning skills.</li>
      </ul>
    </div>

    <div className="text-lg leading-relaxed">
      <span className="font-semibold">⚽ Personal Interests:</span>
      <ul className="list-disc list-inside mt-2 space-y-1"> 
        <li>Outside of work, I am an avid <span className="italic">fitness enthusiast</span> and <span className="italic">soccer player</span>.</li> 
        <li>These help me maintain discipline, focus, and teamwork — qualities I bring into my professional projects.</li>
        <li>I enjoy combining my technical skills with creative problem solving to build projects that make an impact.</li>
      </ul>
    </div>

    <div className="text-lg leading-relaxed">
      <span className="font-semibold">🚀 Goals:</span>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>Work on challenging problems at the intersection of data, AI, and real-world decision making.</li>
        <li>Continue expanding expertise in machine learning, deep learning, and scalable data pipelines.</li>
        <li>Contribute to innovative solutions that have a meaningful, real-world impact.</li>
      </ul>
    </div>
  </div>
</section>


      {/* projects Section */}
      <section id="projects" className="min-h-screen flex flex-col items-center p-8 sm:p-16 space-y-8">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-700 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] pb-4">
          Projects
        </h1>
        <div className="relative z-10 w-full max-w-4xl flex flex-col space-y-8">
          {/* paste your project cards here */}
  

{/* project panels */}
<div className="relative z-10 w-full max-w-4xl flex flex-col gap-6">
  {/* F1 Data Science Project */}
  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl text-gray-100 hover:scale-105 transition-transform">
{/* project Title */}
<h2 className="text-2xl font-bold mb-2">
🏎️ F1 Data Science Project
</h2>

{/* project Overview */}
<p className="mb-4 text-lg leading-relaxed">
In this project, we analyzed F1 racing data from 2019-2023 to build predictive models for race strategy optimization. 
By combining telemetry, weather, and tire data, we identified key factors that impact race outcomes and developed actionable insights for teams.
</p>

{/* key Highlights */}
<ul className="list-disc list-inside mb-4 space-y-1 text-gray-300 text-sm">
<li>Achieved 2nd place out of 25 teams in the Illinois Data Science Club Data Dive Competition.</li>
<li>Built robust data pipelines and processed 25GB of F1 telemetry and weather data.</li>
<li>Developed predictive models using RandomForest and XGBoost with automated evaluation for strategy optimization.</li>
</ul>

{/* skills / technologies */}
<div className="flex flex-wrap gap-2 mb-2">
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">Python</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">Pandas</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">NumPy</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">scikit-learn</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">Matplotlib</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">Seaborn</span>
</div>

{/* links */}
<div className="flex flex-wrap gap-4">
<a
href="https://github.com/Kirtan-Patel234/F1DataScienceProject"
target="_blank"
rel="noopener noreferrer"
className="text-cyan-400 hover:underline text-sm font-semibold"
>
View on GitHub
</a>
<a
href="https://docs.google.com/presentation/d/13iT61qZzYtZkzS-ASt3QIR2clzqY6qycU-6vQbT_3OY/edit?usp=sharing"
target="_blank"
rel="noopener noreferrer"
className="text-cyan-400 hover:underline text-sm font-semibold"
>
View Presentation
</a>
</div>
</div>



  {/* placeholder for Synchrony Datathon */}
  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl text-gray-100 hover:scale-105 transition-transform">
{/* project Title */}
<h2 className="text-2xl font-bold mb-2">
💳 Synchrony Datathon: Q4 Spending & Fraud Detection
</h2>

{/* project Overview */}
<p className="mb-4 text-lg leading-relaxed">
In this project, I developed a complete workflow to forecast quarterly spending, detect potential fraud, and recommend credit line adjustments for financial accounts. 
Using historical account data, transaction patterns, and fraud records, the project provides actionable insights to improve credit risk management and financial decision-making.
</p>

{/* key Highlights */}
<ul className="list-disc list-inside mb-4 space-y-1 text-gray-300 text-sm">
<li>Built a chain forecasting pipeline to predict Q1–Q4 2025 spending using historical financial data.</li>
<li>Developed fraud and delinquency detection models using Random Forest, producing probabilistic risk scores for each account.</li>
<li>Designed a credit line recommendation system integrating predicted spending and fraud risk, optimizing account-level decision-making.</li>
</ul>

{/* skills / technologies */}
<div className="flex flex-wrap gap-2 mb-2">
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">Python</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">Pandas</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">NumPy</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">scikit-learn</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">Matplotlib</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">Feature Engineering</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">Chain Forecasting</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">Fraud & Risk Modeling</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">Jupyter</span>
</div>

{/* links */}
<div className="flex flex-wrap gap-4">
{/* box file as code link */}
<a
href="https://uofi.box.com/s/hdstapyzcb6keozas5t5f9py3xcun0cg"
target="_blank"
rel="noopener noreferrer"
className="text-cyan-400 hover:underline text-sm font-semibold"
>
View Code
</a>
{/* presentation (could also be Box or Slides if separate) */}
<a
href="https://docs.google.com/presentation/d/1TQi6Dq5rmbHfpo_YNHZmey-HK6Nl8J4dzciMPfKkYy0/edit?usp=sharing"
target="_blank"
rel="noopener noreferrer"
className="text-cyan-400 hover:underline text-sm font-semibold"
>
View Presentation
</a>
{/* youTube demo */}
<a
href="https://youtu.be/AygNo0vwkWs"
target="_blank"
rel="noopener noreferrer"
className="text-cyan-400 hover:underline text-sm font-semibold"
>
Watch Demo
</a>
</div>
</div>




  {/* placeholder for Candidate Recommendation Engine */}
<div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl text-gray-100 hover:scale-105 transition-transform">
{/* Project Title */}
<h2 className="text-2xl font-bold mb-2">
🧑‍💼 Candidate Recommendation Engine
</h2>

{/* project Overview */}
<p className="mb-4 text-lg leading-relaxed">
This web app recommends the best candidates for a given job description by ranking resumes based on semantic relevance 
and generating AI-driven summaries explaining each candidate’s fit. The system combines embedding models, resume parsing, 
and generative AI to provide an end-to-end intelligent hiring assistant.
</p>

{/* key Highlights */}
<ul className="list-disc list-inside mb-4 space-y-1 text-gray-300 text-sm">
<li>Developed a semantic similarity pipeline using a fine-tuned SentenceTransformer (all-MiniLM-L6-v2).</li>
<li>Implemented resume parsing and multi-page handling with PyMuPDF (fitz).</li>
<li>Ranked candidates via cosine similarity, achieving ROC AUC of 0.81 on test data.</li>
<li>Integrated Google Gemini API to generate candidate fit summaries with strengths, gaps, and recommendations.</li>
<li>Deployed an interactive user interface with Streamlit for real-time candidate ranking and feedback.</li>
</ul>

{/* skills / technologies */}
<div className="flex flex-wrap gap-2 mb-2">
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">Python</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">Streamlit</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">SentenceTransformers</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">PyTorch</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">Google Gemini API</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">NLP</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">Embeddings</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">PyMuPDF</span>
<span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs font-semibold">Model Fine-tuning</span>
</div>

{/* links */}
<div className="flex flex-wrap gap-4">
{/* code repository */}
<a
href="https://github.com/Kirtan-Patel234/Candidate-Recommendation-Engine/blob/main/app.py"
target="_blank"
rel="noopener noreferrer"
className="text-cyan-400 hover:underline text-sm font-semibold"
>
View on Github
</a>
{/* live demo */}
<a
href="https://candidate-recommendation-engine-ev7c2jixvc3yvtejzbw6kq.streamlit.app"
target="_blank"
rel="noopener noreferrer"
className="text-cyan-400 hover:underline text-sm font-semibold"
>
Live Demo
</a>
</div>
</div>


  {/* placeholder for GPT Wrapper */}
  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl text-gray-100 hover:scale-105 transition-transform">
    <h2 className="text-2xl font-bold mb-2">🧠 GPT Wrapper Portfolio Project</h2>
    <p className="text-lg leading-relaxed">Description goes here.</p>
    <p className="text-sm text-gray-300 mb-2">Key features / technologies go here.</p>
  </div>
</div>

        </div>
      </section>


    </main>
  );
}
