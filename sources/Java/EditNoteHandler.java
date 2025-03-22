package memorize;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;


@WebServlet(name = "EditNoteHandler", urlPatterns = "/u/editnote/")
public class EditNoteHandler extends ActionHandler{

    @Override
    public void init() throws ServletException {
        super.init();
        errorMessage = "Error on attempt to save changes";
        successMessage = "Changes were saved";
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        User user = (User) request.getSession().getAttribute("user");
        String sqlQuery = "UPDATE notes SET title='" + request.getAttribute("title") +
                "', text='" + request.getAttribute("text") + "', align='" + request.getAttribute("align") +"' " +
                "WHERE user_id=" + user.getId() + " AND id=" + request.getAttribute("id");
        processQuery(sqlQuery,request,response);
        //executes query and in case of success returns created note's id to the client
    }
}
