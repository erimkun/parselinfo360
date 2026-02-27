import React, { useEffect, useRef, useState } from 'react';
import type { User, LoginResponse } from '../config/users';
import { Eye, EyeOff } from 'lucide-react';
import KentasLogoWhite from '/KentasLogoWhite.png';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [firmaAdi, setFirmaAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    const canvas = canvasElement;

    const context = canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl');
    if (!context || !('createShader' in context)) return;
    const gl = context as WebGLRenderingContext;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;

      vec3 aurora(vec2 uv, float time) {
        vec2 p = uv - 0.5;
        p.y += 0.3;

        float wave1 = sin(p.x * 3.0 + time * 0.5) * 0.08;
        float wave2 = sin(p.x * 5.0 + time * 0.7 + sin(time * 0.3) * 2.0) * 0.04;
        float wave3 = sin(p.x * 7.0 + time * 1.1 + cos(time * 0.4) * 1.5) * 0.025;
        float wave4 = sin(p.x * 2.0 + time * 0.3 + sin(time * 0.6) * 3.0) * 0.06;

        float y = p.y - wave1 - wave2 - wave3 - wave4;

        float intensity1 = exp(-abs(y) * 16.0) * 0.375;
        float intensity2 = exp(-abs(y + 0.1) * 24.0) * 0.3;
        float intensity3 = exp(-abs(y - 0.05) * 30.0) * 0.225;

        vec3 color1 = vec3(0.2, 0.8, 0.9) * intensity1;
        vec3 color2 = vec3(0.5, 0.3, 0.9) * intensity2;
        vec3 color3 = vec3(0.1, 0.9, 0.6) * intensity3;

        return color1 + color2 + color3;
      }

      vec3 secondaryAurora(vec2 uv, float time) {
        vec2 p = uv - 0.5;
        p.y += 0.1;

        float wave1 = sin(p.x * 2.0 + time * 0.3 + sin(time * 0.2) * 2.5) * 0.06;
        float wave2 = cos(p.x * 4.0 + time * 0.5 + cos(time * 0.35) * 1.8) * 0.03;
        float y = p.y - wave1 - wave2;

        float intensity = exp(-abs(y) * 12.0) * 0.225;
        return vec3(0.8, 0.2, 0.7) * intensity;
      }

      vec3 tertiaryAurora(vec2 uv, float time) {
        vec2 p = uv - 0.5;
        p.y -= 0.2;

        float wave1 = sin(p.x * 1.5 + time * 0.4 + sin(time * 0.25) * 3.0) * 0.07;
        float wave2 = cos(p.x * 3.5 + time * 0.6 + cos(time * 0.45) * 2.2) * 0.035;
        float y = p.y - wave1 - wave2;

        float intensity = exp(-abs(y) * 18.0) * 0.18;
        return vec3(0.3, 0.9, 0.5) * intensity;
      }

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec3 color = vec3(0.03, 0.03, 0.075);

        color += aurora(uv, u_time);
        color += secondaryAurora(uv, u_time + 3.0);
        color += tertiaryAurora(uv, u_time + 1.5);

        vec2 starUv = uv * 120.0;
        vec2 starId = floor(starUv);
        vec2 starFract = fract(starUv);

        float star = noise(starId);
        if (star > 0.985) {
          float starBrightness = (sin(u_time * 1.5 + star * 8.0) * 0.3 + 0.4) * 0.75;
          float starDist = length(starFract - 0.5);
          if (starDist < 0.03) {
            color += vec3(0.8, 0.9, 1.0) * (1.0 - starDist * 30.0) * starBrightness;
          }
        }

        float glow = 1.0 - length(uv - 0.5) * 0.6;
        color += vec3(0.075, 0.15, 0.225) * glow * 0.225;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(context: WebGLRenderingContext, type: number, source: string) {
      const shader = context.createShader(type);
      if (!shader) return null;
      context.shaderSource(shader, source);
      context.compileShader(shader);
      const isCompiled = context.getShaderParameter(shader, context.COMPILE_STATUS);
      if (!isCompiled) {
        context.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    const positionLoc = gl.getAttribLocation(program, 'a_position');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    if (!timeLoc || !resolutionLoc) return;

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    let animationFrameId = 0;

    function render(time: number) {
      const seconds = time * 0.001;
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(timeLoc, seconds);
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = window.requestAnimationFrame(render);
    }

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.cancelAnimationFrame(animationFrameId);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firmaAdi.trim()) {
      setError('Lütfen firma adınızı girin.');
      return;
    }
    
    if (!sifre.trim()) {
      setError('Lütfen şifrenizi girin.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firmaAdi: firmaAdi.trim(),
          sifre
        })
      });

      const data = await res.json() as LoginResponse;
      if (res.ok && data.success && data.user) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Firma adı veya şifre hatalı.');
      }
    } catch {
      setError('Giriş servisine ulaşılamadı. Lütfen tekrar deneyin.');
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white login-aurora-root">
      <canvas ref={canvasRef} className="login-aurora-canvas" />
      <div className="pointer-events-none absolute inset-0 login-aurora-overlay" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-black/30 shadow-2xl backdrop-blur-xl">
          <div className="p-6 pb-0">
            <div className="flex h-32 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-emerald-400/20">
              <img src={KentasLogoWhite} alt="Kentas" className="h-20 w-auto" />
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-xl font-semibold text-white">Parsel360+ Portal Girişi</h1>
              <p className="text-sm text-white/65">Firma hesabınız ile güvenli giriş yapın</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80" htmlFor="firmaAdi">
                  Firma Adı
                </label>
                <input
                  id="firmaAdi"
                  type="text"
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/45 transition focus:border-cyan-300/60 focus:outline-none"
                  placeholder="Firma adınızı girin..."
                  value={firmaAdi}
                  onChange={e => setFirmaAdi(e.target.value)}
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80" htmlFor="sifre">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    id="sifre"
                    type={showPassword ? 'text' : 'password'}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 pr-12 text-white placeholder-white/45 transition focus:border-cyan-300/60 focus:outline-none"
                    placeholder="Şifrenizi girin..."
                    value={sifre}
                    onChange={e => setSifre(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/50 transition hover:text-white/80"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 px-4 py-3 font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Giriş Yapılıyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
