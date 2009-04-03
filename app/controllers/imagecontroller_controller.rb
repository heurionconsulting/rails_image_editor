require 'fileutils.rb'
require 'rmagick'
require 'base64'

class ImagecontrollerController < ApplicationController
  
  def index
  end

  
  def processImage
    begin 
    time=Time.now
    time=time.to_i
    originalDirectory = "#{RAILS_ROOT}/public/images/original/"
    activeDirectory = "#{RAILS_ROOT}/public/images/active/"
    editDirectory = "#{RAILS_ROOT}/public/images/edit/"
    imageName = 'frog.jpg'
    extn = imageName.split('.').last
    newimagename = imageName.gsub(/.jpg/,'')
    @image2Name = newimagename +"_"+time.to_s+"."+extn
    @x = 0
    @y = 0
    action = params[:actiontype]
  puts "action="+action
  case(action)

    when "viewOriginal"
		 FileUtils.cp(originalDirectory+imageName, editDirectory+imageName)

    when "resize" 
      out_w= params[:w].to_i
      out_h = params[:h].to_i
      img = with_image()
      img = img.resize(out_w,out_h)
      save_image(img,@image2Name)
  
      when "rotate" 
        degrees = params[:degrees].to_i
        img = with_image()
        img=img.rotate(degrees)
        save_image(img,@image2Name)
            

      when "crop" 
        @x = params[:x].to_i
        @y = params[:y].to_i
        @w = params[:w].to_i
        @h = params[:h].to_i
        img = with_image()
        unless @w == 0 or @h == 0
          img = img.crop(@x,@y,@w,@h)
        end
        save_image(img,@image2Name)
         img = with_image()
      end
      
   unless File.exists?(File.join(editDirectory,@image2Name))
      @image2Name = imageName
    end
      
    img = with_image()
    @w= img.columns
    @h= img.rows
        
    rescue Magick::ImageMagickError
      logger.error "ImageMagick Error making Deprecated copy of the main image"
      logger.error $!.to_s
      puts $!.to_s
    end      
  end  

  def with_image()
    editDirectory = "#{RAILS_ROOT}/public/images/edit"
    files = Dir.entries(editDirectory)
    img = nil
    puts files.size
    for file in files
    puts file
      next if file == "." or file == ".."
      puts "in2"
      puts file
      img = Magick::Image::read(File.join(editDirectory, file)).first  
      puts "out2"
      break
    end
    puts "out1"
    return img
  end  
  
  def save_image(img,filename)
    delete_directory
    create_directory
    img.write(File.join("#{RAILS_ROOT}/public/images/edit",filename))
  end
  
   def create_directory
      FileUtils.mkdir_p "#{RAILS_ROOT}/public/images/edit"
    end

    def delete_directory
       FileUtils.rm_rf("#{RAILS_ROOT}/public/images/edit")      
    end
end  
