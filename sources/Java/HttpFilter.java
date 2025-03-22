package memorize;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import java.io.IOException;
import java.util.Enumeration;
import java.util.Random;


@WebFilter(filterName = "HttpFilter", urlPatterns = "/*")
public class HttpFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws ServletException, IOException {
        Enumeration<String> params = req.getParameterNames();
        while(params.hasMoreElements()){
            String name = params.nextElement();
            String value = filter(req.getParameter(name));
            req.setAttribute(name,value);
        }
        chain.doFilter(req, resp);
    }

    @Override
    public void destroy() {

    }

    // Filter the string for special HTML characters to prevent
    // command injection attack
    private static String filter(String message) {
        if (message == null) return null;
        StringBuilder result = new StringBuilder(message.length());
        char aChar;

        for (int i = 0; i < message.length(); ++i) {
            aChar = message.charAt(i);
            switch (aChar) {
                case '<': result.append("&lt;"); break;
                case '>': result.append("&gt;"); break;
                case '&': result.append("&amp;"); break;
                case '"': result.append("&quot;"); break;
                case '\'': result.append("&#39;"); break;
                default: result.append(aChar);
            }
        }
        return (result.toString());
    }

}
