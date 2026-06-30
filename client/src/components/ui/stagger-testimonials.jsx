import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SQRT_5000 = Math.sqrt(5000);

const testimonials = [
  {
    tempId: 0,
    testimonial: "The AI Tutor on Mentora is like having a senior engineer sitting next to me. Resolved my React bugs in seconds!",
    by: "Aarav, SDE @ Razorpay",
    imgSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 1,
    testimonial: "Climbing the global leaderboard got me hooked. I finished the entire Javascript course just to beat my friend's score!",
    by: "Priyanka, Student @ IIT Delhi",
    imgSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 2,
    testimonial: "Mentora's interactive quizzes actually test logic. Cleared my technical rounds at Flipkart easily because of them.",
    by: "Rohan, Frontend Engineer @ Flipkart",
    imgSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 3,
    testimonial: "The daily streak system kept me coding every single day. 100-day streak unlocked and got a React internship!",
    by: "Ananya, Student @ BITS Pilani",
    imgSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 4,
    testimonial: "Other courses are just videos, but Mentora lets me write code directly in the browser while watching lectures. Brilliant!",
    by: "Kabir, Full-Stack Dev @ Paytm",
    imgSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 5,
    testimonial: "Verifying my Mentora certificates on LinkedIn got me three recruiter calls in one week. Extremely useful.",
    by: "Ishaan, Backend Engineer @ Zoho",
    imgSrc: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 6,
    testimonial: "Learned Docker and Kubernetes from a working DevOps lead here. Real industry knowledge, zero academic fluff.",
    by: "Diya, DevOps Engineer @ Wipro",
    imgSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 7,
    testimonial: "Stuck on a nested MongoDB query for two hours. The AI Tutor explained it with code blocks instantly. Worth every rupee.",
    by: "Vikram, Software Engineer @ TCS",
    imgSrc: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 8,
    testimonial: "The Leaderboard XP points made learning feel like playing a game. Best gamified coding platform in India.",
    by: "Aditi, Student @ DTU",
    imgSrc: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 9,
    testimonial: "Loved how the instructors are industry practitioners from companies like Meta and Razorpay. Very practical tips!",
    by: "Yash, React Developer @ Cognizant",
    imgSrc: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 10,
    testimonial: "As a beginner, I was afraid of command-line tools. Mentora's structured paths made Git and Linux so simple.",
    by: "Sai, Systems Engineer @ Infosys",
    imgSrc: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 11,
    testimonial: "I love the micro-learning format. 10-minute high-quality videos let me study Python even during my daily commute.",
    by: "Neha, Data Analyst @ Mu Sigma",
    imgSrc: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 12,
    testimonial: "Weekly coding challenges and XP awards kept our college dev club highly competitive. Mentora is amazing.",
    by: "Arjun, Dev Club Lead @ VIT",
    imgSrc: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 13,
    testimonial: "The lifetime course access and instant AI debugging support helped me switch from QA to Frontend Dev.",
    by: "Riya, Frontend Dev @ LTI",
    imgSrc: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 14,
    testimonial: "Finally a platform where quizzes test system design and real-world edge cases instead of memorizing syntax.",
    by: "Dev, SDE-2 @ Tech Mahindra",
    imgSrc: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 15,
    testimonial: "Completed the AI & Machine Learning path. The projects are actual production-ready apps, not basic models.",
    by: "Meera, ML Engineer @ Fractal Analytics",
    imgSrc: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 16,
    testimonial: "Mentora's UI is beautiful and runs incredibly fast. The gamified streaks are highly addictive!",
    by: "Sanjay, UI Engineer @ Freshworks",
    imgSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 17,
    testimonial: "The certificates are tamper-proof and include verification links. Recruiters appreciated the authenticity.",
    by: "Tara, HR Tech Lead @ TalentAcquire",
    imgSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 18,
    testimonial: "I recommended Mentora to my entire department. The peer leaderboard rankings doubled our learning speed.",
    by: "Sameer, Tech Lead @ HCL",
    imgSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    tempId: 19,
    testimonial: "The instant feedback on programming errors inside the editor is a lifesaver. No compiler setup required!",
    by: "Kirti, Software Developer @ Mindtree",
    imgSrc: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
  }
];

const TestimonialCard = ({ 
  position, 
  testimonial, 
  handleMove, 
  cardSize 
}) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer transition-all duration-500 ease-in-out select-none",
        isCenter 
          ? "z-10 bg-[#E8602E]" 
          : "z-0 bg-white/[0.06] hover:bg-white/[0.15]"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? "0px 8px 0px 4px rgba(232, 96, 46, 0.08)" : "0px 0px 0px 0px transparent"
      }}
    >
      <div 
        className={cn(
          "absolute inset-[2.5px] p-8 flex flex-col justify-between overflow-hidden",
          isCenter ? "bg-zinc-950 text-white" : "bg-[#0c0c0c] text-zinc-400"
        )}
        style={{
          clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        }}
      >
        <div>
          <img
            src={testimonial.imgSrc}
            alt={`${testimonial.by.split(',')[0]}`}
            className="mb-4 h-14 w-12 bg-zinc-900 object-cover object-top border border-white/[0.08] rounded"
            style={{
              boxShadow: "3px 3px 0px #060606"
            }}
          />
          <h3 className={cn(
            "text-base sm:text-lg font-bold leading-relaxed",
            isCenter ? "text-white" : "text-zinc-400"
          )}>
            "{testimonial.testimonial}"
          </h3>
        </div>
        
        <p className={cn(
          "mt-2 text-xs font-semibold italic",
          isCenter ? "text-[#E8602E]" : "text-zinc-500"
        )}>
          - {testimonial.by}
        </p>
      </div>
    </div>
  );
};

export const StaggerTestimonials = () => {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);

  const handleMove = (steps) => {
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-transparent select-none"
      style={{ height: 600 }}
    >
      {testimonialsList.map((testimonial, index) => {
        const position = testimonialsList.length % 2
          ? index - (testimonialsList.length + 1) / 2
          : index - testimonialsList.length / 2;
        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}
      
      {/* Navigation Buttons */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3 z-20">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-colors border",
            "bg-[#0c0c0c] border-white/[0.08] hover:border-[#E8602E] text-zinc-400 hover:text-white",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E8602E] active:scale-95"
          )}
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-colors border",
            "bg-[#0c0c0c] border-white/[0.08] hover:border-[#E8602E] text-zinc-400 hover:text-white",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E8602E] active:scale-95"
          )}
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
