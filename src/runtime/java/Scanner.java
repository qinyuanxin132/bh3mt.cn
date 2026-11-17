package lab.runtime;

// InputStream-based Scanner subset for TeaVM's compact browser class library.
public final class Scanner implements java.io.Closeable {
    private java.io.InputStream reader;
    private String text; private int textOffset; private int surrogate = -1;
    private int pending = -2;
    public Scanner(java.io.InputStream input) { reader = input; }
    public Scanner(String input) { text = input; }
    private int readChar() throws java.io.IOException {
        if (text != null) return textOffset < text.length() ? text.charAt(textOffset++) : -1;
        if (surrogate >= 0) { int result = surrogate; surrogate = -1; return result; }
        int first = reader.read();
        if (first < 0 || first < 128) return first;
        int n = (first & 224) == 192 ? 1 : (first & 240) == 224 ? 2 : 3;
        int value = first & (n == 1 ? 31 : n == 2 ? 15 : 7);
        for (int i = 0; i < n; i++) { int b = reader.read(); if (b < 0) return 65533; value = (value << 6) | (b & 63); }
        if (value > 65535) { value -= 65536; surrogate = 56320 | (value & 1023); return 55296 | (value >> 10); }
        return value;
    }
    private int peek() {
        if (pending == -2) try { pending = readChar(); } catch (java.io.IOException e) { throw new RuntimeException(e); }
        return pending;
    }
    private int take() { int value = peek(); pending = -2; return value; }
    public boolean hasNext() { while (peek() >= 0 && Character.isWhitespace((char)peek())) take(); return peek() >= 0; }
    public boolean hasNextLine() { return peek() >= 0; }
    public String next() {
        if (!hasNext()) throw new IllegalStateException("No more input");
        StringBuilder token = new StringBuilder();
        while (peek() >= 0 && !Character.isWhitespace((char)peek())) token.append((char)take());
        return token.toString();
    }
    public String nextLine() {
        if (peek() < 0) throw new IllegalStateException("No more input");
        StringBuilder line = new StringBuilder();
        while (peek() >= 0 && peek() != '\n' && peek() != '\r') line.append((char)take());
        if (peek() == '\r') { take(); if (peek() == '\n') take(); } else if (peek() == '\n') take();
        return line.toString();
    }
    public int nextInt() { return Integer.parseInt(next()); }
    public long nextLong() { return Long.parseLong(next()); }
    public double nextDouble() { return Double.parseDouble(next()); }
    public float nextFloat() { return Float.parseFloat(next()); }
    public boolean nextBoolean() { String s = next(); if (s.equalsIgnoreCase("true")) return true; if (s.equalsIgnoreCase("false")) return false; throw new IllegalArgumentException(s); }
    public void close() { try { if (reader != null) reader.close(); } catch (java.io.IOException e) { throw new RuntimeException(e); } }
}
