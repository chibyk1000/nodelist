

$(document).ready(function () {
    $('#nav-toggle').click(function () {
        // alert('it works')
        // $('.side-icon').toggleClass('d-none')
        // $(".side-item .nav-link, .dash-text").toggleClass("d-none");
        $(".main").toggleClass("main-collapse");
        // $(".navbar").toggleClass("nav_collapse");
        $('.sidebar').toggleClass('close')
    })



    $('#profile').submit(async function (e) { 
        e.preventDefault();


        const data = {
          firstname: $("#firstname").val(),
          lastname: $("#lastname").val(),
          email: $("#email").val(),
        };

        const resp = await fetch("/admin/update-profile", {
            method: "PUT",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "Application/json"
            }
        });
        const output = await resp.json();
        console.log(output);
       
        
    });

    $("#pass_frm").submit(async function (event) {
        event.preventDefault();
        try {
            
            const data = {
                current_password: $('#current_password').val(),
                new_password: $('#new_password').val(),
                confirm_password: $('#confirm_password').val(),
            }
            console.log(data)
           const resp = await fetch("/admin/update-pass", {
                method: "PUT",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "Application/json"
                }
           });
            const datas = await resp.json();
            console.log(datas.message)
        } catch (error) {
            console.log(error)
        }
    });
$('.addblogfrm').submit( async function (e) { 
    e.preventDefault();
const title = $('#title').val()
    const author = $('#author').val()
    const details = $('#details').html()
    const file = $("#file").prop("files")[0];
    const formData = new FormData()
    formData.append('author', author)
    formData.append('details', details)
    formData.append('file', file)
    formData.append('title', title)
    console.log(file)

 const resp = await   axios.post("/admin/add-blog", formData,    {
     headers: {
          "Content-Type": "multipart/form-data"
      }
  });
    // const data = await response.json()
    console.log(resp)
    if (resp.status === 200) {
        location.reload()
    }
});

    
    $('.deletefrm').submit(function (e) { 
        e.preventDefault();
        $.ajax({
            type: "delete",
            url: "/admin/delete-blog",
            data: {blogId: $('.blogId').val()},
            dataType: "text",
            success: function (response) {
                console.log(response)
            }
        });
        
    });
    
    
});